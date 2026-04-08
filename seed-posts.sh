#!/bin/bash
API="http://localhost:5194/api"

login() {
  curl -s -X POST "$API/auth/login" -H "Content-Type: application/json" -d "{\"emailOrUsername\":\"$1\",\"password\":\"test1234\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

T1=$(login aziza_s)
T2=$(login farxod_m)
T3=$(login nodira_r)
T4=$(login dilshod_k)
T5=$(login zarina_a)

echo "Tokens: T1=${#T1} T2=${#T2} T3=${#T3} T4=${#T4} T5=${#T5}"

post() {
  local token=$1 title=$2 content=$3 cat=$4 region=$5 level=$6
  curl -s -X POST "$API/posts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $token" \
    -d "{\"title\":\"$title\",\"content\":\"$content\",\"categoryId\":$cat,\"regionId\":$region,\"educationLevel\":$level}" > /dev/null
  echo -n "."
}

echo -n "Creating posts"

# Aziza (T1) - 6 posts
post "$T1" "5-sinf bolalarini darsga qiziqtirish usullari" "Bugun men sinfdagi tajribamni baham kormoqchiman. Bolalarni darsga jalb qilishning eng samarali usullaridan biri hayotiy misollar bilan boshlash." 1 1 3
post "$T1" "Interaktiv darslar yaratish boyicha maslahatlar" "Interaktiv darslar yaratish uchun avvalo oquvchilarning qiziqishlarini bilish kerak. Har bir darsda kamida bitta interaktiv mashq bolishi lozim." 1 1 3
post "$T1" "Oquvchilar bilan ishonch ornatish sirlari" "Ishonch ornatish uchun har bir bolaga individual etibor berish kerak. Ularning fikrlarini tinglash va hurmat qilish eng muhim qadam hisoblanadi." 1 1 3
post "$T1" "Darsda guruh ishlarini samarali tashkil etish" "Guruh ishlarini tashkil etishda har bir guruhga aniq vazifalar berish kerak. Guruh azolari ortasida rollarni taqsimlash samaradorlikni oshiradi." 3 1 3
post "$T1" "Biologiya fanini qiziqarli oqitish yollari" "Biologiya darslarida amaliy tajribalar otkazish bolalarning qiziqishini oshiradi. Mikroskop bilan ishlash va tabiatga sayohatlar juda foydali." 15 1 4
post "$T1" "Maktab kutubxonasidan samarali foydalanish" "Kutubxona faqat kitob oqish joyi emas balki oquvchilar uchun tadqiqot markazi ham bolishi mumkin. Har hafta kutubxona soatlari tashkil etish foydali." 9 1 0

# Farxod (T2) - 6 posts
post "$T2" "Sinf intizomini saqlashning 10 ta qoidasi" "Sinf intizomini saqlash uchun aniq qoidalar ornatish va ularga izchil rioya qilish kerak. Har bir oquvchi qoidalarni bilishi va tushunishi shart." 2 3 3
post "$T2" "Qiyin oquvchilar bilan ishlash tajribasi" "Har bir sinfda qiyin oquvchilar boladi. Ular bilan ishlashda sabr va individual yondashuv eng muhim omillardir. Ota-onalar bilan hamkorlik ham zarur." 2 3 3
post "$T2" "Darsda vaqtni togri taqsimlash sanati" "45 daqiqalik darsni samarali taqsimlash uchun dars rejasini oldindan tayyorlash kerak. Har bir bosqichga aniq vaqt ajratish lozim." 4 3 3
post "$T2" "Oqituvchi va ota-onalar ortasidagi munosabat" "Ota-onalar bilan muntazam aloqa ornatish oquvchining muvaffaqiyatiga katta tasir korsatadi. Ota-onalar yigilishlarini foydali otkazish muhim." 8 3 0
post "$T2" "Yangi oqituvchilar uchun birinchi kun maslahatlari" "Birinchi ish kuningiz eng muhim kun hisoblanadi. Ozingizni tanishtiring va oquvchilar bilan dostona munosabat ornating. Qoidalarni aniq belgilang." 12 3 0
post "$T2" "Sinf muhitini yaxshilash boyicha goyalar" "Sinf muhiti oquvchilarning kayfiyatiga tasir qiladi. Devorlarni rangbarang plakatlar bilan bezash va osimliklar qoyish foydali hisoblanadi." 2 3 3

# Nodira (T3) - 6 posts
post "$T3" "Google Classroom platformasidan foydalanish" "Google Classroom oqituvchilar uchun ajoyib vosita hisoblanadi. Vazifalarni berish tekshirish va baholar qoyish juda oson boladi. Bepul va qulay." 6 4 4
post "$T3" "Kahoot va Quizizz orqali interaktiv testlar" "Kahoot platformasi orqali darsni oyin shaklida otkazish mumkin. Oquvchilar musobaqa ruhida bilimlarini sinab korishadi va dars qiziqarli otadi." 6 4 3
post "$T3" "Online darslar otkazish tajribasi va muammolar" "Pandemiya davrida online darslar otkazishni organdik. Internet tezligi va texnik muammolar eng katta qiyinchiliklar boldi lekin tajriba qoldik." 13 4 0
post "$T3" "Raqamli savodxonlik asoslarini orgatish" "Bolalarga internetdan xavfsiz foydalanishni orgatish bugungi kunning eng dolzarb masalalaridan biri hisoblanadi. Kiberxavfsizlik haqida sozing." 6 4 3
post "$T3" "Prezentatsiya tayyorlash mahorati va qoidalari" "Yaxshi prezentatsiya tayyorlash uchun matnni kam rasm va grafiklarni kop ishlatish kerak. Har bir slaydda bitta asosiy fikr bolishi lozim." 9 4 5
post "$T3" "Suniy intellekt va talimda uning orni" "Suniy intellekt talim sohasida katta imkoniyatlar yaratmoqda. ChatGPT va boshqa vositalardan oqitishda unumli foydalanish mumkin va zarur." 6 4 5

# Dilshod (T4) - 6 posts
post "$T4" "Matematika darslarida oyin elementlari" "Bolalar matematikani yoqtirmaydi deb oylardim. Ammo oyin elementlarini kiritganimdan keyin hamma narsa ozgardi. Kartochkalar va musobaqalar foydali." 3 5 3
post "$T4" "Fizika fanini hayotiy misollar bilan oqitish" "Fizika qonunlarini hayotiy misollar bilan tushuntirish bolalarning tushunishini osonlashtiradi. Masalan tortishish kuchini olma tushishi bilan." 3 5 4
post "$T4" "Kimyoviy tajribalarni xavfsiz otkazish" "Kimyo darslarida tajribalar otkazish bolalarning qiziqishini oshiradi. Ammo xavfsizlik qoidalariga qattiq rioya qilish shart va muhim masaladir." 3 5 4
post "$T4" "Tarix darslarida interfaol usullar" "Tarix darslarini qiziqarli qilish uchun rolli oyinlar va munozaralar otkazish mumkin. Oquvchilar tarixiy shaxslar rolini oynashadi va tushunishadi." 3 5 4
post "$T4" "Baholash tizimini takomillashtirish boyicha fikrlar" "Ananaviy baholash tizimi har doim ham samarali emas. Portfolio baholash va loyiha asosidagi baholash yangi tendentsiya hisoblanadi va samarali." 5 5 0
post "$T4" "Oquvchilarda tanqidiy fikrlashni rivojlantirish" "Tanqidiy fikrlash 21-asr konikmalaridan biri hisoblanadi. Munozaralar va muammoli vaziyatlarni hal qilish mashqlari orqali rivojlantirish mumkin." 3 5 4

# Zarina (T5) - 6 posts
post "$T5" "Ingliz tili darslarida kommunikativ yondashuv" "Til orgatishning eng samarali usuli bu muloqot. Men darsda 70 foiz vaqtni oquvchilarning ozaro suhbatiga ajrataman va natijalar ajoyib." 3 7 4
post "$T5" "Maxsus ehtiyojli bolalar bilan ishlash usullari" "Har bir bola oziga xos va ular bilan ishlashda individual yondashuv kerak. Inklyuziv talim barcha bolalar uchun teng imkoniyat yaratadi." 7 7 0
post "$T5" "Maktabgacha talimda oyin texnologiyalari" "Kichik yoshdagi bolalar oyin orqali organishadi. Didaktik oyinlar va ijodiy mashgulotlar bolalarning rivojlanishiga katta yordam beradi." 3 7 1
post "$T5" "Inklyuziv talimda muvaffaqiyat sirlari" "Inklyuziv talim barcha bolalar uchun teng imkoniyat yaratadi. Maxsus dasturlar va individual rejalar ishlab chiqish zarur va muhimdir." 14 7 0
post "$T5" "Ona tili darslarida kitob oqish madaniyati" "Kitob oqish madaniyatini shakllantirish uchun har kungi oqish soatini joriy etish kerak. Bolalarga yoshiga mos kitoblar tavsiya qilish muhim." 10 7 3
post "$T5" "Jismoniy tarbiya va salomatlik asoslari darsda" "Jismoniy tarbiya darslari bolalarning salomatligini mustahkamlaydi. Har bir darsda isitish mashqlari va oyinlar bolishi kerak va zarurdir." 3 7 3

echo ""
echo "ALL 30 POSTS CREATED"

# Verify
COUNT=$(curl -s "$API/posts?pageSize=1" | grep -o '"totalCount":[0-9]*' | cut -d: -f2)
echo "Total posts in DB: $COUNT"