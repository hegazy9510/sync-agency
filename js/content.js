/* SYNC AGENCY — default content.
   Everything here is overridden by the control panel (/admin → content/*.json).
   Edit from the panel, not here. */
const TXT={
 ar:{nWork:"الأعمال",nAbout:"عنّي",nSvc:"الخدمات",nCl:"العملاء",nCt:"تواصل معنا",
  h1:"نصمم الصورة اللي <span>الجمهور بيفتكرها</span>",
  hSub:"بوسترات أفلام ومسلسلات، كليبات وأغاني، سوشيال ميديا وذكاء اصطناعي — لأكبر الأسماء في الوطن العربي.",
  b1:"شوف الأعمال",b2:"ابدأ مشروعك",
  wEy:"أعمال مختارة",wH:"البورتفوليو",
  aEy:"عنّي",aName:"محمد حجازي",
  aHook:"قبل ما الإعلان ينزل، وقبل ما الأغنية تكسّر… فيه <span>صورة واحدة</span> الناس بتشوفها الأول. وأنا اللي بصنعها.",
  about:["آرت دايركتور ومؤسس <strong>SYNC AGENCY</strong>، شغال في التصميم والميديا والماركتنج من <strong>2012</strong>. صنعت هوية أكبر الأفلام والمسلسلات وأقوى الأغاني في الوطن العربي مع كبرى الشركات.",
   "حاصل على دبلومة Adobe سنة 2020، و<strong>أول من اشتغل بالذكاء الاصطناعي في الوطن العربي</strong> وحوّله لأداة إبداع حقيقية."],
  sEy:"إيه اللي بنعمله",sH:"الخدمات",cEy:"اشتغلنا مع",cH:"العملاء",
  ctEy:"عندك مشروع؟",ctH:"يلا <span>نبدأ.</span>",ctP:"احكيلنا فكرتك ونرجعلك في أسرع وقت.",ctB:"ابعت إيميل",
  foot:"© 2026 SYNC AGENCY — محمد حجازي",top:"للأعلى ↑",drag:"اسحب واستكشف الأعمال",all:"الكل",demo:"عرض تجريبي — حط لينك الفيديو في الكود"},
 en:{nWork:"Work",nAbout:"About",nSvc:"Services",nCl:"Clients",nCt:"Let's talk",
  h1:"We design what <span>the world remembers</span>",
  hSub:"Film & series posters, music videos, social media and AI visuals — for the biggest names in the Arab world.",
  b1:"View work",b2:"Start a project",
  wEy:"Selected work",wH:"Portfolio",
  aEy:"About",aName:"Mohamed Hegazy",
  aHook:"Before the trailer drops, before the song hits #1 — there's <span>one image</span> everyone sees first. I make that image.",
  about:["Art Director and founder of <strong>SYNC AGENCY</strong>, working in design, media and marketing since <strong>2012</strong>. I've built the visual identity of the Arab world's biggest films, series and chart-topping songs with its leading studios and labels.",
   "Adobe-certified (2020), and <strong>the first creative in the Arab world to work with Artificial Intelligence</strong> — turning it into a real creative tool."],
  sEy:"What we do",sH:"Services",cEy:"Trusted by",cH:"Clients",
  ctEy:"Have a project?",ctH:"Let's <span>Sync.</span>",ctP:"Tell us your idea — we'll get back to you fast.",ctB:"Send an email",
  foot:"© 2026 SYNC AGENCY — Mohamed Hegazy",top:"Back to top ↑",drag:"Drag to explore",all:"All",demo:"Demo — add your video link in the code"}
};
const CATS={film:["أفلام","Films"],series:["مسلسلات","Series"],music:["أغاني","Music"],video:["كليبات","Videos"],social:["سوشيال","Social"],ai:["ذكاء اصطناعي","AI"]};
let STATS=[["14","+","سنة خبرة","Years"],["500","+","مشروع","Projects"],["120","+","شركة وبراند","Brands"],["1","st","أول واحد بالـ AI","AI pioneer"]];
let TAGS=["Art Direction","Key Art","Motion","Branding","Social Media","Generative AI","Adobe 2020"];
let PORTRAIT=""; // صورتك: "me.jpg"

let WORKS=[]; // filled from content/*.json (control panel)
let SERVICES=[["بوسترات الأفلام","Movie Posters","بوستر رئيسي، تيزر، وبوسترات الشخصيات.","Key art, teasers and character posters."],
 ["حملات المسلسلات","Series Campaigns","حملات رمضان والمنصات من الألف للياء.","Ramadan & streaming campaigns, end to end."],
 ["الأغاني والكليبات","Music & Clips","أغلفة أغاني وألبومات وإخراج فني للكليبات.","Covers, album art and video clip direction."],
 ["السوشيال ميديا","Social Media","حملات إطلاق وموشن ومحتوى يوقف السكرول.","Launch campaigns, motion and scroll-stopping content."],
 ["الذكاء الاصطناعي","AI Production","صور وأفلام بالذكاء الاصطناعي بجودة سينمائية.","Cinematic AI visuals, films and hybrid pipelines."],
 ["الهوية البصرية","Brand Identity","لوجوهات وهويات للفنانين والبراندات.","Logos and identities for artists and brands."]];
let CLIENTS=["Client 01","Client 02","Client 03","Client 04","Client 05","Client 06","Client 07","Client 08"]; // أو "clients/logo.png"
let EMAIL="hello@syncagency.com";
let LINKS=[["Instagram","@hegazy_official","https://www.instagram.com/hegazy_official/"],["Instagram","@syncagency.eg","https://www.instagram.com/syncagency.eg/"],["Facebook","@hegazyds10","https://www.facebook.com/hegazyds10"],["Behance","Portfolio","#"],["WhatsApp","Chat","#"]];
