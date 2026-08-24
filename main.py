from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Literal, Optional
import os
from dotenv import load_dotenv
import fitz  # PyMuPDF
from docx import Document as DocxDocument
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import uuid
from datetime import datetime
import io

load_dotenv()

# Get API keys from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Initialize Groq client
try:
    from groq import Groq
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except ImportError:
    groq_client = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for uploaded documents
documents_store = {}

# In-memory storage for generated contracts
contracts_store = {}

class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    document_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    word_count: int

class ContractRequest(BaseModel):
    contract_type: str  # "rent", "employment", "nda"
    party1_name: str
    party2_name: str
    terms: dict  # Contract-specific terms

class ContractResponse(BaseModel):
    contract_id: str
    filename: str
    download_url: str

SYSTEM_PROMPT = """أنت مساعد قانوني ذكي متخصص في القانون المصري. دورك هو:

1. **الإجابة بوضوح ودقة**: قدم معلومات قانونية مفصلة ومنظمة
2. **التنظيم الجيد**: استخدم تنسيقًا واضحًا مع:
   • استخدم Markdown في ردودك (جداول، عناوين، bold) لما يفيد وضوح الإجابة
   • عناوين واضحة للأقسام المختلفة
   • نقاط مرقمة للخطوات والإجراءات
   • جداول للمقارنات والمعلومات المتعددة الأعمدة
   • فقرات قصيرة سهلة القراءة
3. **الأمانة المهنية**:
   • اذكر المصادر القانونية عند الإمكان (القوانين، المواد)
   • أشر بوضوح عندما تحتاج الحالة لاستشارة محامٍ مختص
   • فرّق بين المعلومات العامة والمشورة القانونية المحددة
4. **الأمثلة العملية**: قدم أمثلة واقعية عندما يساعد ذلك في التوضيح
5. **اللغة**: استخدم العربية الواضحة، وادعم الإنجليزية عند الحاجة

⚖️ **تنبيه مهم**: هذه معلومات قانونية عامة وليست مشورة قانونية رسمية. للحالات المحددة، يُنصح باستشارة محامٍ مختص.

---

You are an intelligent legal assistant specialized in Egyptian law. Your role:

1. **Clear & Accurate Answers**: Provide detailed, well-organized legal information
2. **Good Structure**: Use clear formatting with:
   • Clear section headings
   • Numbered lists for steps and procedures
   • Short, readable paragraphs
3. **Professional Integrity**:
   • Cite legal sources when possible (laws, articles)
   • Clearly indicate when a case needs a specialized lawyer
   • Distinguish between general information and specific legal advice
4. **Practical Examples**: Provide real-world examples when helpful
5. **Language**: Use clear Arabic, support English when needed

⚖️ **Important Note**: This is general legal information, not formal legal advice. For specific cases, consulting a specialized lawyer is recommended."""

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF"""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx"""
    doc = DocxDocument(io.BytesIO(file_bytes))
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text

async def call_llm(messages: List[dict]) -> str:
    """Call Groq LLM"""
    if not groq_client:
        raise HTTPException(
            status_code=500,
            detail="No API key configured. Please set GROQ_API_KEY in .env"
        )

    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=0.6,  # Slightly lower for more focused responses
            max_tokens=3072,  # Increased for detailed answers
            top_p=0.9,
            frequency_penalty=0.2,  # Reduce repetition
            presence_penalty=0.1,
        )
        return response.choices[0].message.content
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "rate_limit" in error_str.lower():
            raise HTTPException(
                status_code=429,
                detail="الموديل مشغول، حاول تاني بعد ثواني"
            )
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and extract text from PDF or DOCX"""
    try:
        # Validate file type
        filename = file.filename.lower()
        if not filename.endswith(('.pdf', '.docx')):
            raise HTTPException(
                status_code=400,
                detail="نوع الملف غير مدعوم. يرجى رفع PDF أو DOCX فقط"
            )

        # Validate filename length
        if len(file.filename) > 255:
            raise HTTPException(
                status_code=400,
                detail="اسم الملف طويل جداً"
            )

        # Read file with size limit (10MB)
        max_size = 10 * 1024 * 1024
        file_bytes = await file.read()
        if len(file_bytes) > max_size:
            raise HTTPException(
                status_code=413,
                detail="حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت"
            )

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="الملف فارغ"
            )

        # Extract text based on file type
        try:
            if filename.endswith('.pdf'):
                text = extract_text_from_pdf(file_bytes)
            elif filename.endswith('.docx'):
                text = extract_text_from_docx(file_bytes)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"فشل قراءة الملف. تأكد من أن الملف غير تالف: {str(e)}"
            )

        # Validate extracted text
        if not text or len(text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="الملف لا يحتوي على نص كافٍ للتحليل"
            )

        # Generate document ID and store
        document_id = str(uuid.uuid4())
        word_count = len(text.split())

        # Truncate if too long (roughly 8000 tokens = 6000 words)
        max_words = 6000
        if word_count > max_words:
            words = text.split()[:max_words]
            text = " ".join(words) + "\n\n[تم اختصار النص لطوله]"

        documents_store[document_id] = {
            "filename": file.filename,
            "text": text,
            "word_count": word_count,
            "uploaded_at": datetime.now().isoformat()
        }

        return DocumentUploadResponse(
            document_id=document_id,
            filename=file.filename,
            word_count=word_count
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل تحليل الملف: {str(e)}")

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Validate message
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=400,
                detail="الرسالة فارغة"
            )

        if len(request.message) > 4000:
            raise HTTPException(
                status_code=400,
                detail="الرسالة طويلة جداً. الحد الأقصى 4000 حرف"
            )

        # Validate history length
        if len(request.history) > 50:
            raise HTTPException(
                status_code=400,
                detail="تاريخ المحادثة طويل جداً"
            )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # If document is attached, inject it into system message
        if request.document_id:
            if request.document_id not in documents_store:
                raise HTTPException(
                    status_code=404,
                    detail="المستند المرفق غير موجود. يرجى رفعه مرة أخرى"
                )
            doc = documents_store[request.document_id]
            doc_context = f"\n\nالمستند المرفق ({doc['filename']}):\n\n{doc['text']}"
            messages[0]["content"] += doc_context

        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": request.message})

        reply = await call_llm(messages)

        if not reply or len(reply.strip()) == 0:
            raise HTTPException(
                status_code=500,
                detail="لم يتم استلام رد من النموذج"
            )

        return ChatResponse(reply=reply)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"حدث خطأ غير متوقع: {str(e)}")

def generate_contract_content(contract_type: str, party1: str, party2: str, terms: dict) -> str:
    """Generate contract clauses using LLM"""

    templates = {
        "rent": f"""قم بإنشاء عقد إيجار مصري قانوني بين:
الطرف الأول (المؤجر): {party1}
الطرف الثاني (المستأجر): {party2}

الشروط:
- العقار: {terms.get('property_address', '[العنوان]')}
- مدة الإيجار: {terms.get('duration', '[المدة]')}
- القيمة الإيجارية: {terms.get('rent_amount', '[المبلغ]')} جنيه مصري شهرياً

يجب أن يشمل العقد:
1. تعريف الأطراف
2. وصف العقار
3. مدة الإيجار وتاريخ البدء
4. قيمة الإيجار وطريقة السداد
5. التزامات المؤجر
6. التزامات المستأجر
7. شروط إنهاء العقد
8. بند النزاعات والتحكيم

اكتب العقد بصيغة قانونية احترافية، مرقمة، وواضحة.""",

        "employment": f"""قم بإنشاء عقد عمل مصري قانوني بين:
صاحب العمل: {party1}
الموظف: {party2}

الشروط:
- المسمى الوظيفي: {terms.get('job_title', '[المسمى]')}
- الراتب: {terms.get('salary', '[الراتب]')} جنيه مصري شهرياً
- مدة العقد: {terms.get('duration', '[المدة]')}

يجب أن يشمل العقد:
1. تعريف الأطراف
2. المسمى الوظيفي ومهام العمل
3. الراتب والمزايا
4. مدة العقد وتاريخ البدء
5. ساعات العمل والإجازات
6. الالتزامات والواجبات
7. شروط إنهاء العقد
8. السرية وعدم المنافسة

اكتب العقد بصيغة قانونية احترافية، مرقمة، وواضحة.""",

        "nda": f"""قم بإنشاء اتفاقية سرية (NDA) مصرية قانونية بين:
الطرف الأول: {party1}
الطرف الثاني: {party2}

الشروط:
- الغرض: {terms.get('purpose', '[الغرض من الاتفاقية]')}
- مدة السرية: {terms.get('duration', '[المدة]')}

يجب أن تشمل الاتفاقية:
1. تعريف الأطراف
2. تعريف المعلومات السرية
3. الالتزام بالسرية
4. الاستثناءات من السرية
5. مدة الاتفاقية
6. التزامات الأطراف
7. العقوبات والتعويضات
8. بند فض المنازعات

اكتب الاتفاقية بصيغة قانونية احترافية، مرقمة، وواضحة."""
    }

    prompt = templates.get(contract_type)
    if not prompt:
        raise HTTPException(status_code=400, detail="نوع العقد غير مدعوم")

    # Optional custom clauses from the "ملاحظات إضافية" field
    notes = (terms.get("notes") or "").strip()
    if notes:
        prompt += (
            "\n\nبنود وشروط خاصة إضافية اتفق عليها الطرفان، أدرجها كبند مستقل مرقّم "
            "داخل العقد بنص كما هي دون تغيير جوهري:\n"
            f"{notes}"
        )

    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "أنت محامٍ مصري متخصص في صياغة العقود القانونية. اكتب النص القانوني فقط بدون أي تنسيق Markdown (بدون علامات ** أو ## أو |) — نص عادي مرقّم فقط، لأن النص سيُدرج مباشرة في ملف Word."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=3000,
        )
        content = response.choices[0].message.content
        return strip_markdown(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل إنشاء العقد: {str(e)}")


def strip_markdown(text: str) -> str:
    """Remove markdown formatting artifacts from LLM output before writing to Word"""
    import re
    # Remove bold/italic markers
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    # Remove headers markers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove table pipes (convert table rows to plain lines)
    text = re.sub(r'^\|', '', text, flags=re.MULTILINE)
    text = re.sub(r'\|$', '', text, flags=re.MULTILINE)
    # Remove horizontal rules
    text = re.sub(r'^-{3,}$', '', text, flags=re.MULTILINE)
    return text.strip()

def _arabic_font_paths():
    """Find an Arabic-capable font on Windows (Arial preferred, Tahoma fallback)"""
    regular = r"C:\Windows\Fonts\arial.ttf"
    bold = r"C:\Windows\Fonts\arialbd.ttf"
    if os.path.exists(regular) and os.path.exists(bold):
        return regular, bold
    return r"C:\Windows\Fonts\tahoma.ttf", r"C:\Windows\Fonts\tahomabd.ttf"


def create_contract_pdf(contract_text: str, filepath: str):
    """Build the final PDF contract with proper Arabic RTL text shaping"""
    import re

    from fpdf import FPDF

    def safe_multi_cell(pdf: FPDF, text: str, height: float = 7, align: str = "R"):
        """Render a line, degrading shaping gracefully if the shaping engine chokes"""
        # In RTL mode fpdf2 leaves x at the right margin after a cell — reset it,
        # otherwise the next line has no horizontal space left
        pdf.set_x(pdf.l_margin)
        try:
            pdf.multi_cell(0, height, text, align=align)
        except Exception:
            try:
                pdf.set_text_shaping(direction=None)
                pdf.multi_cell(0, height, text, align=align)
                pdf.set_text_shaping(direction="rtl")
            except Exception:
                pdf.set_text_shaping(use_shaping_engine=False)
                pdf.multi_cell(0, height, text, align=align)
                pdf.set_text_shaping(direction="rtl")

    font_regular, font_bold = _arabic_font_paths()

    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()
    pdf.add_font("arabic", "", font_regular)
    pdf.add_font("arabic", "B", font_bold)

    # Red disclaimer banner
    pdf.set_font("arabic", "B", 12)
    pdf.set_text_color(220, 0, 0)
    pdf.set_text_shaping(direction="rtl")
    safe_multi_cell(pdf, "مسودة تم إنشاؤها بالذكاء الاصطناعي - تحتاج لمراجعة محامٍ مختص قبل الاستخدام الرسمي", align="C")
    pdf.ln(4)

    # Contract body
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("arabic", "", 12)
    for line in contract_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        # Long underscore/dot runs crash the RTL shaping engine — normalize them
        line = re.sub(r"[_\.]{3,}", "—", line)
        safe_multi_cell(pdf, line)

    # Signature section (blanks drawn as real lines — underscore runs are unsafe)
    pdf.ln(8)
    col_width = (pdf.w - pdf.l_margin - pdf.r_margin) / 2
    today = datetime.now().strftime("%Y-%m-%d")
    rows = [
        ("الطرف الأول:", "الطرف الثاني:"),
        ("التوقيع:", "التوقيع:"),
        (f"التاريخ: {today}", f"التاريخ: {today}"),
    ]
    for right_label, left_label in rows:
        # In RTL reading order the first party appears on the right side
        y = pdf.get_y() + 6
        right_x = pdf.w - pdf.r_margin
        left_x = pdf.r_margin
        pdf.cell(col_width, 8, right_label, align="R")
        pdf.cell(col_width, 8, left_label, align="R")
        pdf.line(right_x - 45, y, right_x - 5, y)
        pdf.line(left_x - 45, y, left_x - 5, y)
        pdf.ln(10)

    pdf.output(filepath)


@app.post("/api/documents/generate-contract", response_model=ContractResponse)
async def generate_contract(request: ContractRequest):
    """Generate a PDF contract document"""
    try:
        # Generate contract content using LLM
        contract_text = generate_contract_content(
            request.contract_type,
            request.party1_name,
            request.party2_name,
            request.terms
        )

        # Save to temporary location
        contract_id = str(uuid.uuid4())
        os.makedirs("temp_contracts", exist_ok=True)
        filepath = f"temp_contracts/{contract_id}.pdf"
        create_contract_pdf(contract_text, filepath)

        contract_types_ar = {
            "rent": "عقد_إيجار",
            "employment": "عقد_عمل",
            "nda": "اتفاقية_سرية"
        }
        filename = f"{contract_types_ar.get(request.contract_type, 'عقد')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        contracts_store[contract_id] = {
            "filename": filename,
            "filepath": filepath,
            "created_at": datetime.now().isoformat()
        }

        return ContractResponse(
            contract_id=contract_id,
            filename=filename,
            download_url=f"/api/documents/download/{contract_id}"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"فشل إنشاء العقد: {str(e)}")

@app.get("/api/documents/download/{contract_id}")
async def download_contract(contract_id: str):
    """Download generated contract"""
    if contract_id not in contracts_store:
        raise HTTPException(status_code=404, detail="العقد غير موجود")

    contract = contracts_store[contract_id]
    return FileResponse(
        path=contract["filepath"],
        filename=contract["filename"],
        media_type="application/pdf"
    )

@app.get("/health")
async def health():
    return {"status": "ok"}
