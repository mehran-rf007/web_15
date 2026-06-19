// ============================================================================
// موتور پرامپت پیشرفته (Advanced Prompt Engine) — فاز ۱
// ورودی کاربر (دسته محصول، سبک، مدل، یادداشت) را به یک
// پرامپت ساختاریافته‌ی بهینه برای مدل تصویر تبدیل می‌کند.
// مزیت رقابتی اصلی همین لایه است: تکنیک «قفل محصول».
// ============================================================================

export type Style = "studio" | "editorial" | "lifestyle";
export type Quality = "standard" | "pro";
export type ProductCategory = "bag" | "shoe" | "clothing" | "accessory" | "generic";

export interface PromptInput {
  category: ProductCategory;
  style: Style;
  hasModel: boolean;          // آیا عکس مدل داده شده (دلخواه یا آماده)؟
  modelHijab?: boolean;       // مدل با حجاب (بازار ایران)
  hasBackground?: boolean;    // آیا تصویر پس‌زمینه‌ی دلخواه داده شده؟
  userNotes?: string;         // توضیح دلخواه کاربر (فارسی/انگلیسی)
  quality: Quality;
}

// توصیف صحنه بر اساس سبک
const STYLE_MAP: Record<Style, string> = {
  studio:
    "clean professional studio product photography, seamless neutral background, soft diffused box lighting, crisp shadows, sharp focus",
  editorial:
    "high-end editorial fashion photography, dramatic directional lighting, magazine-quality composition, cinematic color grading, shallow depth of field",
  lifestyle:
    "natural lifestyle photography, realistic everyday environment, warm ambient daylight, candid authentic feel",
};

// راهنمایی مختص هر دسته‌ی محصول برای حفظ جزئیات
const CATEGORY_HINTS: Record<ProductCategory, string> = {
  bag: "showcase the bag's full silhouette, hardware, stitching and material texture; show it held or placed naturally",
  shoe: "show the footwear at a flattering 3/4 angle, preserve sole, laces, logo and material finish",
  clothing: "keep the garment's fit, fabric drape, seams, patterns and color exactly; ensure natural body fit",
  accessory: "highlight fine details, reflections and scale of the accessory",
  generic: "present the product clearly as the hero of the composition",
};

// تکنیک قفل محصول: جلوگیری از تغییر دادن جزئیات توسط مدل
const PRODUCT_LOCK =
  "CRITICAL CONSTRAINT: reproduce the provided product with 100% fidelity — keep its exact shape, proportions, color, texture, material, logos and all printed details unchanged. Do NOT redesign, restyle, recolor or hallucinate any part of the product. The product in the output must be pixel-faithful to the reference.";

const NEGATIVE =
  "Avoid: distorted product, altered logo, wrong colors, extra limbs, deformed hands, watermark, text artifacts, low resolution.";

export function buildPrompt(input: PromptInput): string {
  const subject = input.hasModel
    ? "Composite the provided product naturally onto the provided human model, with correct scale, perspective and contact shadows"
    : "Place the provided product on a suitable professional human model appropriate for the scene";

  const modelGuide = input.hasModel && input.modelHijab
    ? "The model wears modest clothing and a hijab; keep styling tasteful and culturally appropriate."
    : "";

  const backgroundGuide = input.hasBackground
    ? "Use the provided background image as the scene; integrate the product and model into it with matching lighting direction, perspective, color temperature and realistic contact shadows so it looks seamlessly composited."
    : "";

  const qualityGuide =
    input.quality === "pro"
      ? "Render at maximum resolution, ultra-detailed, commercial print quality."
      : "Render a fast preview draft, good composition, moderate detail.";

  const notes = input.userNotes?.trim()
    ? `Additional art direction from the seller: "${input.userNotes.trim()}".`
    : "";

  return [
    subject + ".",
    CATEGORY_HINTS[input.category] + ".",
    STYLE_MAP[input.style] + ".",
    modelGuide,
    backgroundGuide,
    PRODUCT_LOCK,
    qualityGuide,
    "Photorealistic, commercially usable, balanced composition.",
    notes,
    NEGATIVE,
  ]
    .filter(Boolean)
    .join(" ");
}
