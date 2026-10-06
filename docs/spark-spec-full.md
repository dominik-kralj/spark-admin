# Sustav za naplatu parkiranja

**SPARK – jedan sustav, tri komponente, cjelovito upravljanje gradskim parkingom.**

Izmjene dokumenta

| Datum      | Verzija | Opis                                 |
|------------|---------|--------------------------------------|
| 17.08.2026 | 1.0.0   | Inicijalna verzija (draft)           |
| 08.09.2026 | 1.0.1   | Dodana opcija slikanja vozila za DPK |

## 1. Uvod i pregled sustava

U ovom dokumentu opisan je sustav radnog imena **„SPARK“ (Samobor parking)**. Glavna svrha sustava je modernizacija naplate parkiranja kroz jedinstvenu digitalnu platformu. Sustav vozačima (domaćim i stranim) omogućuje brzo i jednostavno plaćanje putem mobilnih uređaja, a gradovima pruža napredan alat za kontrolu uplate, analitiku i izvještavanje.

„SPARK“ preuzima najbolje prakse postojećih rješenja, eliminira njihove nedostatke te ih objedinjuje u cjelovitu platformu.

**Pregled SPARK sustava**

SPARK je cjelovita digitalna platforma za upravljanje gradskim parkingom koja objedinjuje administraciju, kontrolu parkiranja na terenu i naplatu parkiranja krajnjim korisnicima.

Sustav je koncipiran tako da povezuje tri ključna sudionika parking sustava:

- **grad odnosno parking operatera**

- **kontrolore parkiranja**

- **krajnje korisnike parkinga**

Svakoj skupini namijenjena je zasebna komponenta sustava, dok sve komponente koriste zajedničku centralnu SPARK infrastrukturu i podatke.

SPARK se sastoji od tri osnovne komponente:

1.  **SPARK Admin** – administracija i izvještavanje za gradove i parking operatere

2.  **SPARK Inspector** – Android aplikacija za kontrolore parkiranja

3.  **SPARK WhatsApp Parking** – naplata parkiranja krajnjim korisnicima putem WhatsAppa.

**SPARK Admin**

**SPARK Admin** predstavlja administrativni i izvještajni dio SPARK platforme namijenjen gradovima i parking operaterima.

Putem SPARK Admin aplikacije ovlašteni korisnici upravljaju parametrima sustava te imaju centralizirani pregled podataka nastalih kroz naplatu i kontrolu parkiranja.

SPARK Admin predstavlja centralno mjesto s kojeg grad odnosno parking operater može pratiti funkcioniranje SPARK sustava.

Administrativni dio obuhvaća upravljanje podacima potrebnim za rad sustava, poput parking zona, cjenika, kontrolora i drugih konfiguracijskih parametara.

Izvještajni dio omogućuje pregled podataka o naplati parkiranja, izdanim dnevnim parkirnim kartama, radu kontrolora i ostalim poslovnim događajima evidentiranim kroz sustav.

Osnovna svrha SPARK Admin komponente je omogućiti gradu **centraliziranu administraciju, nadzor i izvještavanje nad cjelokupnim parking sustavom**.

**SPARK Inspector**

**SPARK Inspector** je Android aplikacija namijenjena kontrolorima parkiranja koji obavljaju kontrolu vozila na terenu.

Aplikacija je projektirana tako da kontroloru omogući što jednostavniji i brži postupak provjere vozila.

Kontrolor može pokrenuti provjeru vozila na jedan od tri načina:

- očitavanjem registarske oznake pomoću kamere i ANPR-a

- ručnim unosom registarske oznake

- glasovnim izgovaranjem registarske oznake

Nakon što je registarska oznaka određena, aplikacija šalje zahtjev centralnom SPARK sustavu koji provjerava postoji li za vozilo važeće parkiranje.

Ako vozilo ima važeće parkiranje, kontroloru se prikazuje odgovarajuća informacija.

Ako vozilo nema važeće parkiranje, sustav evidentira **prvo opažanje vozila** zajedno s vremenom opažanja i kontrolorom koji je izvršio provjeru.

Kontrolor ne mora odmah izdati dnevnu parkirnu kartu. Nakon isteka vremena definiranog pravilima parkiranja ponovno provjerava isto vozilo. Na taj način vrijeme prvog opažanja ne ovisi o ručnom unosu kontrolora, nego predstavlja podatak evidentiran u centralnom sustavu prilikom prve provjere vozila.

SPARK Inspector također omogućuje evidentiranje i izdavanje dnevne parkirne karte kada su ispunjeni propisani uvjeti.

Osnovna svrha SPARK Inspector komponente je **ubrzati rad kontrolora, smanjiti potrebu za ručnim unosom podataka te osigurati centraliziranu evidenciju kontrole vozila i izdavanja dnevnih parkirnih karata**.

**SPARK WhatsApp Parking**

**SPARK WhatsApp Parking** predstavlja korisnički dio sustava namijenjen plaćanju parkiranja.

Za razliku od klasičnih mobilnih parking aplikacija, korisnik za korištenje sustava ne mora instalirati posebnu SPARK aplikaciju.

Komunikacija s korisnikom odvija se putem **WhatsAppa**.

Korisnik kroz WhatsApp pokreće postupak parkiranja, nakon čega ga SPARK vodi kroz potrebne korake za određivanje parkiranja i izvršenje plaćanja.

Nakon uspješno izvršene transakcije parkiranje se evidentira u centralnom SPARK sustavu, a korisnik putem WhatsAppa dobiva potvrdu. Prednost takvog pristupa je što korisnik koristi komunikacijsku aplikaciju koju potencijalno već ima instaliranu na mobilnom uređaju.

To je posebno značajno kod povremenih korisnika i turista koji zbog jednokratnog ili kratkotrajnog korištenja parkinga ne moraju instalirati posebnu lokalnu parking aplikaciju.

Osnovna svrha SPARK WhatsApp Parking komponente je **omogućiti jednostavan digitalni kanal za prijavu i plaćanje parkiranja krajnjim korisnicima**.

**Međusobna povezanost komponenti**

Ključna karakteristika SPARK platforme je da SPARK Admin, SPARK Inspector i WhatsApp Parking nisu tri nepovezana proizvoda.

Sve tri komponente predstavljaju različita korisnička sučelja nad zajedničkim SPARK sustavom. Primjerice, korisnik može izvršiti plaćanje parkiranja putem WhatsAppa.

Podatak o plaćenom parkiranju evidentira se u centralnom SPARK sustavu.

Kada kontrolor nekoliko trenutaka kasnije putem SPARK Inspector aplikacije očita registarsku oznaku tog vozila, Inspector putem centralnog sustava dobiva informaciju da vozilo ima važeće parkiranje. Istovremeno grad kroz SPARK Admin ima mogućnost administracije sustava i pregleda relevantnih podataka i izvještaja. Time se zatvara cijeli poslovni proces.

**Pozicioniranje SPARK platforme**

SPARK se stoga ne pozicionira samo kao sustav za WhatsApp naplatu parkiranja niti samo kao aplikacija za kontrolore. SPARK predstavlja **integriranu platformu za digitalno upravljanje gradskim parkingom**.

Tri komponente pokrivaju tri ključna područja:

| **Komponenta**             | **Korisnik**            | **Namjena**                                          |
|----------------------------|-------------------------|------------------------------------------------------|
| **SPARK Admin**            | Grad / parking operater | Administracija, nadzor i izvještavanje               |
| **SPARK Inspector**        | Kontrolor               | Kontrola vozila i izdavanje dnevnih parkirnih karata |
| **SPARK WhatsApp Parking** | Korisnik parkinga       | Prijava i plaćanje parkiranja                        |

Na taj način SPARK povezuje **grad, kontrolora i korisnika** unutar jedinstvenog sustava te omogućuje da podaci nastali u jednom dijelu sustava budu neposredno dostupni ostalim komponentama kojima su potrebni.

**Prednosti koje sustav zadržava:**

- **Jednostavnost:** Zadržava se brzina i intuitivnost kakvu ima mParking (SMS plaćanje) samo putem WhatsApp poruka umjesto SMS-a.

- **Univerzalnost:** Otvara se mogućnost plaćanja za vozila s inozemnim registarskim oznakama upravo zahvaljujući WhatsApp i plaćanju karticama.

**Problemi koje sustav rješava:**

- **Skriveni troškovi:** Eliminira se dodatna naknada koju tele operatori naplaćuju za slanje SMS-a (ili se naplaćuje ali je višestruko jeftinije).

- **Ograničenost mParkinga:** Strani državljani trenutačno ne mogu koristiti SMS naplatu; SPARK to rješava uvođenjem alternativnih kanala plaćanja (kartice/aplikacija).

- **Problemi s očitavanjem tablica:** U lošim vremenskim uvjetima (snijeg, blato) kamere ne mogu očitati tablicu. Sustav uvodi provjeru glasom (kontrolor glasom unosi tablicu).

**Koje su mane postojećih sustava i kako ih SPARK rješava:**

**mParking:**

**Potpuna eliminacija skrivenih troškova za vozače:** Kod mParkinga, tele operateri korisnicima naplaćuju fiksnu naknadu za slanje SMS-a (oko 0,12 EUR po poruci). SPARK koristi WhatsApp aplikaciju i internet, čime se ta naknada u potpunosti ukida pa korisnik plaća isključivo stvarnu cijenu karte (omjer 1:1).

**Potpuna dostupnost stranim turistima:** Strani državljani ne mogu slati SMS-ove na domaće mParking brojeve. Budući da SPARK koristi viva.com gateway, omogućuje prihvat bilo koje strane kreditne ili debitne kartice, pretvarajući strane turiste u platiše i povećavajući prihode grada.

**Nula inicijalnih troškova za gradove:** Implementacija SPARK sustava i aplikacije za kontrolore potpuno je besplatna za lokalnu samoupravu, dok održavanje mParking integracija i SMS linija često uključuje provizije i fiksne troškove.

**Produženje karte:** Kod mParkinga moraš ponovo slati SMS upisom reg. Oznake vozila. Kod SPARKa u WhatsApp razgovor samo upišeš DA nakon što dobiješ poruku o skorom isteku parkiranja.

**Scan & Pay:**

**Web sučelje:** Ako korisnik nakon uplate zatvori internetski preglednik (tab) na mobitelu ili mu se isprazni baterija, on gubi uvid u aktivno parkiranje. Sustav mu ne može poslati "push" obavijest da karta istječe, a za produženje se mora fizički vratiti do aparata i ponovno skenirati QR kod. Kod SPARKa komunikacija se odvija kroz WhatsApp Chatbot. Sustav automatski šalje aktivnu poruku **15 minuta prije isteka karte** izravno u WhatsApp chat (koji ostaje trajno dostupan bez obzira na zatvaranje aplikacije).

**Produženje karte:** Produženje zahtijeva ponovni prolazak kroz web sučelje, a ako je sesija istekla, i ponovno upisivanje podataka s bankovne kartice. Kod SPARKa korisnik kartu produžuje tako da na primljenu obavijest u WhatsApp chatu **odgovori s jednostavnim tekstom "DA"**. Sustav u pozadini automatski tereti sigurno spremljeni token kartice, bez potrebe za otvaranjem ikakvih linkova ili ponovnim skeniranjem.

**Brzina plaćanja kod idućeg plaćanja parkiranja:** Prilikom svakog novog parkiranja na drugoj lokaciji, korisnik mora fizički izaći iz automobila, doći do aparata, skenirati QR kod i ponovno proći cijeli proces unosa podataka (ako web preglednik nije zapamtio formu). Kod SPARKa nakon što jednom inicijalizira sustav, korisnik pri svakom idućem parkiranju **uopće ne mora tražiti aparat niti skenirati QR kod na znaku**. Može ostati sjediti u automobilu i chatbotu jednostavno poslati poruku s novom zonom i registracijom (npr. *"708101 ZG1234AA"*), a plaćanje se izvršava odmah preko tokenizirane kartice.

**Potreba za unosom podataka o kartici:** Zbog sigurnosnih protokola na webu, korisnici često moraju ispočetka upisivati broj kartice, rok valjanosti i CVC kod ako sustav ne podržava naprednu tokenizaciju unutar preglednika. Kod SPARKa kroz integraciju s Viva.com / Stripe gatewayem, SPARK nakon prve kupnje **sigurno sprema token kartice** (sukladno PCI-DSS standardu, bez spremanja CVC-a u vlastitu bazu). Svako sljedeće parkiranje pretvara se u *One-click payment* unutar chatbota.

**PayDo:**

**Potreba za instalacijom aplikacije:** Kako bi korisnik platio parking, mora otići na App Store ili Google Play, preuzeti aplikaciju, registrirati se s e-mailom, potvrditi račun i tek onda unijeti karticu. To stvara frustraciju ako korisnik žuri ili se nalazi u području s lošim mobilnim internetom. SPARK Sustav koristi **WhatsApp**, aplikaciju koju gotovo svaki vozač (domaći i strani) već ima instaliranu i aktivnu na svom mobitelu. Nema registracije, nema kreiranja novih lozinki i nema trošenja memorije uređaja na još jednu namjensku aplikaciju.

**Strani turisti:** Strani turisti koji u Hrvatskoj borave svega nekoliko dana rijetko su voljni instalirati lokalnu aplikaciju za parkiranje samo za jedno ili dva korištenja. Radije riskiraju kaznu ili gube vrijeme tražeći sitni novac za aparate. Kod SPARK rješenja strani turist jednostavno skenira QR kod na prometnom znaku, što mu odmah otvara WhatsApp chat na materinjem jeziku. Budući da SPARK koristi globalno prepoznatljiv **viva.com gateway**, turist plaća svojom uobičajenom karticom bez ikakvih prepreka.

**Korisničko sučelje:** Korisnik mora navigirati kroz složene izbornike aplikacije, ručno birati grad, tražiti zonu na karti ili popisu, te klikati kroz nekoliko koraka kako bi potvrdio uplatu. Kod SPARK rješenja plaćanje se vrši kroz prirodan razgovor s chatbotom. Korisnik jednostavno pošalje poruku s formatom **"zona registracija"** (npr. *708101 ZG1234AA*). Sustav je dovoljno pametan da odmah razumije unos, izda link ili automatski naplati parkiranje ako je kartica već tokenizirana.

**Produženje karte:** Kada stigne obavijest o isteku, korisnik mora otključati mobitel, otvoriti aplikaciju PayDo, ući pod aktivna parkiranja i ponovno proći proces autorizacije plaćanja. U SPARKu korisniku poruka o isteku stiže izravno u WhatsApp chat 15 minuta ranije. Produljenje se obavlja slanjem **jedne jedine riječi: "DA"**. Sustav automatski povlači sredstva preko sigurnog tokena i karta je produžena u jednoj sekundi.

2\. Ciljevi i poslovna vrijednost  
Glavni cilj sustava je ponuditi gradovima modernu i isplativiju zamjenu za postojeće sustave naplate te povećati prihod kroz prihvat plaćanja inozemnih posjetitelja.

**Vrijednost za gradove:**

- **Veći prihodi:** Naplata parkinga stranim turistima koji su do sada često ostajali izvan mParking sustava.

- **Nula inicijalnih troškova:** Potpuno besplatna implementacija sustava i besplatna aplikacija za kontrolore na terenu.

- **Brža kontrola:** Kontrolori mogu provjeriti naplatu glasovnim unosom kada je fizička tablica nečitljiva ili skrivena, eliminirajući potrebu za ručnim tipkanjem.

**Vrijednost za krajnje korisnike (Vozače):**

- **Omjer cijene 1:1:** Korisnik plaća isključivo stvarnu cijenu parkiranja, bez naknada teleoperatorima.

- **Plaćanje bez prepreka:** Nadoplata parkinga vrši se izravno kroz sustav, bez potrebe za fizičkim skeniranjem QR kodova na aparatima.

- **Nacionalna pokrivenost:** Strani i domaći korisnici mogu koristiti istu platformu na području cijele Hrvatske.

Korisnici i uloge

**2. Korisnici i uloge u sustavu (Stakeholders & User Roles)**

Sustav „SPARK“ prepoznaje tri ključne skupine korisnika, od kojih svaka koristi zaseban segment platforme:

**1. Gradovi (Administratori sustava)**

Predstavnici lokalne samouprave ili komunalnih poduzeća koji upravljaju naplatom.

- **Upravljanje konfiguracijom:** Definiranje i izmjena parkirnih zona, cijena, vremenskih ograničenja te unos povlaštenih karata (npr. stanari, invalidi).

- **Analitika i izvještavanje:** Pristup web sučelju za napredno praćenje transakcija u realnom vremenu, analizu prihoda i izvoz financijskih izvještaja.

**2. Kontrolori (Terenski djelatnici)**

Zaposlenici na terenu koji provjeravaju status naplate i izdaju kazne.

- **Provjera naplate:** Korištenje namjenske **Android aplikacije** za brzu provjeru vozila (putem glasovnog unosa registarske oznake ili ručnog upisa).

- **Izdavanje DPK (Dnevnih parkirnih karata):** Automatsko generiranje i ispisivanje kazni na terenu putem prijenosnog **Bluetooth (BT) pisača** izravno iz Android aplikacije.

**3. Krajnji korisnici (Vozači – domaći i strani)**

Fizičke i pravne osobe koje koriste parkirna mjesta.

- **Interakcija kroz WhatsApp Chatbot:** Korisnici ne instaliraju novu aplikaciju, već cijeli proces (prijava zone, unos registracije) obavljaju slanjem poruka unutar WhatsAppa.

- **Digitalno plaćanje:** Sustav inicira sigurno plaćanje i tereti kreditnu ili debitnu karticu korisnika putem integriranog **viva.com** payment gatewaya.

- **Jednostavno produljenje:** Korisnik prima obavijest na WhatsApp prije isteka karte i može je produžiti slanjem jednostavnog odgovora, bez potrebe za ponovnim unosom podataka ili skeniranjem QR kodova.

Primjeri (Use Cases)

**Primjeri za kontrolore:**

**Primjer 1: Provjera naplate parkiranja ručnim unosom**

1.  *Kontrolor klikne na button „Ručni unos“ i upisuje reg. Oznaku vozila bez crtica i razmaka. Npr.: ZG5566AI*

2.  *Sustav provjerava da li postoji aktivna parkirna karta za tu reg. oznaku.*

3.  *Ako postoji prikazuje zelenu kvačicu i ispisuje reg. Oznaku, te zonu i do kada parkiranje vrijedi.*

4.  *Ako ne postoji ili je istekla prikazuje crveni križić i button „Izdaj dnevnu kartu“. “. Ako je dnevna karta već izdana za tu reg. Oznaku na buttonu piše „Ispiši dnevnu kartu“.*

**Primjer 2: Provjera naplate parkiranja slikanjem reg. Oznake**

1.  *Kontrolor klikne na button „Slikaj reg. Oznaku (ANPR)“. Prikazuje mu se kamera i on slika reg. Oznaku vozila. OCR pretvori sliku u tekst i pošalje tekst sustavu.*

2.  *Sustav provjerava da li postoji aktivna parkirna karta za tu reg. oznaku.*

3.  *Ako postoji prikazuje zelenu kvačicu i ispisuje reg. Oznaku, te zonu i do kada parkiranje vrijedi.*

4.  *Ako ne postoji ili je istekla prikazuje crveni križić i button „Izdaj dnevnu kartu“. Ako je dnevna karta već izdana za tu reg. Oznaku na buttonu piše „Ispiši dnevnu kartu“.*

**Primjer 3: Provjera naplate parkiranja glasom**

1.  *Kontrolor klikne na button „Izgovori reg. oznaku“. Aktivira se Speech To Text opcija i on izgovara reg. oznaku. Speech to text pretvori izgovoreno u tekst i pošalje tekst sustavu.*

2.  *Sustav provjerava da li postoji aktivna parkirna karta za tu reg. oznaku.*

3.  *Ako postoji prikazuje zelenu kvačicu i ispisuje reg. Oznaku, te zonu i do kada parkiranje vrijedi.*

4.  *Ako ne postoji ili je istekla prikazuje crveni križić i button „Izdaj dnevnu kartu“. “. Ako je dnevna karta već izdana za tu reg. Oznaku na buttonu piše „Ispiši dnevnu kartu“.*

**Primjer 4: Izdavanje dnevne parkirne karte**

1.  Kontrolor nakon provjere klikne na button „Izdaj dnevnu kartu“ ili „Ispiši dnevnu kartu“ ovisno o tome da li je dnevna karta za tu reg. Oznaku već izdana.

2.  Sustav kreira novu dnevnu kartu, fiskalizira je i ispisuje ili u drugom slučaju samo ispisuje postojeću dnevnu kartu bez izdavanja nove.

**Primjeri za korisnike (Domaći i strani korisnici parkiranja):**

**Primjer 1: Prva inicijacija kad korisnik još nema u Wapp SPARK broj (Onboarding)**

1.  *Korisnik šalje poruku 708001 ZG5553AI na jedinstveni WhatsApp Business broj.*

2.  *C# Minimal API prihvaća Webhook i radi brzi INSERT u staging tablicu TICKETS u spark_work bazi sa statusom U_OBRADI.*

3.  *Sustav provjerava tablicu PAYMENT_TOKENS u radnoj bazi te utvrđuje da korisnik nema spremljenu karticu.*

4.  *Korisnik na WhatsApp dobiva automatsku poruku s unikatnim linkom na siguran Viva WebView prozor.*

5.  *Korisnik otvara link, unosi karticu i uspješno rješava 3D Secure autorizaciju svoje banke.*

6.  *Viva prosljeđuje trajne i sigurne tokene (CustomerId, PaymentMethodId) na C# Webhook, koji ih upisuje u radnu bazu tekuće godine.*

7.  *Sustav izvršava prvu naplatu, programski šalje XML zahtjev Poreznoj upravi za fiskalizaciju, upisuje podatke u fiskalizirane_karte i vraća potvrdu na WhatsApp „Parkiranje vozila ZG4457IA uspješno je aktivirano u Samoboru, 2A. zona. Vrijedi do 15:50, a iznos parkiranja je 0,70 EUR. Naknada je obračunata prema važećem cjeniku. Transakcija: 33934983749. Vaš SPARK“).*

**Primjer 2: Plaćanje parkinga svaki idući put**

1.  *Korisnik parkira vozilo (npr. po mraku ili snijegu) i šalje poruku 708001 ZG5553AI na isti WhatsApp broj.*

2.  *C# u tekućoj radnoj bazi pronalazi Viva.com token za taj broj mobitela.*

3.  *Sustav provjerava limit produljenja (vidi UC 3). Ako je u redu, šalje pozadinski, izravni Confirm API zahtjev Viva.com-u (Off-Session). **Korisnik ne mora otvarati nikakve linkove niti upisivati brojeve.***

4.  *Viva odobrava transakciju u milisekundama, C# automatski fiskalizira račun i šalje instantnu potvrdu o plaćenom parkingu te o vremenu isteka kao i u prvom slučaju.*

**Primjer 3: Produživanje parkiranja**

1.  *Sustav provjerava karte koje ističu za x minuta te da li su dosegle limit produživanja (npr max. 3 produživanja dozvoljeno) te ako postoje karte koje zadovoljavaju šalje korisniku x minuta prije isteka aktivnog parkiranja na WhatsApp poruku: „Poštovani, Vaša parkirna karta za vozilo ZG5545IA u Samoboru u 2A zoni ističe u 14:24“. Broj transakcije: 33934983749. Ako želite produžiti parkiranje pošaljite „DA“*

2.  *Korisnik upisuje „DA“, sustav obnovi parkiranje odnosno kreira novu kartu s početkom kada trenutno aktivna karta završava te na taj početak dodaje x minuta ovisno o zoni parkiranja.*

Opseg sustava po modulima

U prvoj verziji sustava potrebno je razviti 4 modula.

- **Web sučelje za Administratore (gradovi**)

  - **Tehnologija:** React (Responsive dizajn prilagođen radu na stolnim i tablet računalima).

  - **Funkcionalnosti:**

    - **Autentifikacija:** Sigurna prijava putem korisničkog imena i lozinke.

    - **Upravljanje zonama:** Pregled, unos, izmjena i brisanje parkirnih zona (ID zone, naziv, cijena po satu, maksimalno trajanje parkiranja).

    - **Povlašteni korisnici:** Pregled, unos i izmjena povlaštenih karata povezanih s registarskom oznakom.

    - **Pregled naplaćenih karata:** Tablični prikaz u realnom vremenu s filtrima (datum, zona, registracija, status fiskalizacije).

    - **Pregled i izdavanje DPK:** Pregled svih kazni koje su izdali kontrolori na terenu.

    - **Izvještavanje i Export:** Generiranje financijskih i statističkih izvještaja uz mogućnost izvoza u **PDF** format ili automatskog slanja na predefinirani e-mail. Izvještaje generiramo već postojećim alatom koji koristimo i za ostale projekte.

    - **Postavke grada:** Pregled i ažuriranje osnovnih podataka o gradu (OIB, adresa, IBAN, podaci za fiskalizaciju).

- **Korisničko sučelje za kontrolore (Android aplikacija)**

  - **Tehnologija:** Native Android aplikacija (Kotlin).

  - **Funkcionalnosti:**

    - **Autentifikacija:** Prijava s dodijeljenim korisničkim podacima kontrolora.

    - **Provjera registarske oznake (3 načina unosa):**

      1.  *Ručni unos:* Klasično tipkanje tablice na tipkovnici.

      2.  *Slikanje (ANPR/OCR):* Korištenje kamere uređaja za automatsko prepoznavanje tablice s vozila.

      3.  *Glasovni unos:* Kontrolor pritisne mikrofon i izgovori registarsku oznaku (sustav koristi Speech-to-Text tehnologiju za prepoznavanje).

    - **Provjera statusa:** Sustav u djeliću sekunde provjerava bazu i vraća vizualni odgovor: **ZELENO** (Plaćeno do 14:45 ili Povlašteno parkiranje) ili **CRVENO** (Nije plaćeno). Provjerava se zapis u spark_work bazi tablica TICKETS pod uvjetom da je autorizacija plaćanja prošla.

> **Mogući razlozi za CRVENO:**

- Karta nije kupljena.

- Karta je kupljena ali je istekla.

- Autorizacija plaćanja nije prošla.

  - **Izdavanje DPK:** Ako je status crven, aplikacija automatski generira Dnevnu parkirnu kartu, šalje podatke na backend radi fiskalizacije te šalje nalog za ispis na **Bluetooth (BT) prijenosni pisač**. Koristiti će se standardne ESC/POS komande a za ispis QR codea koristit ćemo zxyng biblioteku ako printer ne podržava ispis QR codea nativno.

<!-- -->

- **WhatsApp Bot**

  - **Tehnologija:** WhatsApp Business API + Chatbot engine.

  - **Funkcionalnosti i Korisnički tok (User Flow):**

    - *Inicijacija:* Korisnik pokrene WhatsApp aplikaciju, odabere SPARK broj ili skenira QR code na znaku (ako je prvi puta)

    - *Unos podataka:* Bot traži od korisnika unos **zone** i **registarske oznake** (npr. "708101 ZG1234AA").

    - *Plaćanje (Prva kupnja):* Bot generira i šalje siguran, jednokratni link za plaćanje preko **Viva.com** platforme. Korisnik unosi karticu na zaštićenoj Viva.com stranici. Sustav sigurno sprema token kartice za buduća plaćanja (One-click payment).

    - *Potvrda:* Nakon uspješne naplate, bot šalje poruku s potvrdom (broj računa, zona, vrijeme trajanja).

    - *Produljenje:* 15 minuta prije isteka karte, bot šalje obavijest: *"Vaša karta istječe za 15 min. Želite li produljiti za još x sat/minuta ovisno o zoni? Odgovorite s DA."* Ako korisnik odgovori s "DA", sustav automatski tereti spremljeni token kartice bez ponovnog otvaranja linka.

- **BackEnd**

  - **Tehnologija:** C# .NET Core WebAPI, Relacijska baza podataka (MS SQL Server 22 Express).

  - **Dapper.** Zbog brzine za sve operacije koje pristupaj bazi podataka koristimo Dapper Async funkcije.

  - **Funkcionalnosti:**

    - **WhatsApp API Integracija:** Upravljanje dolaznim i odlaznim porukama, obavijestima o isteku i izdavanju DPK.

    - **Payment Gateway (Viva.com & Viva.com arhitektura**): Implementacija Viva.com API-ja za naplatu i tokenizaciju kartica. Kod arhitekture API-ja primijeniti Factory pattern kako bi se u budućnosti mogao lagano dodati Viva.com ili drugi gateway.

    - **Fiskalizacija (Porezna uprava RH):** Automatska fiskalizacija u trenutku transakcije. Razviti pozadinski radnik (Background Worker) koji svakih X minuta provjerava i asinkrono naknadno fiskalizira transakcije koje su pale zbog gubitka internetske veze s Poreznom upravom.

    - **WebAPI Client:** WebAPI koji koriste android applikacija kontrolora i backend client aplikacija za gradove.

Aplikacija SPARK Inspector

Aplikacija SPARK Inspector je aplikacija koju koriste kontrolori grada koji naplaćuje uslugu parkiranja. Aplikacija ima samo dvije funkcije:

- Provjera da li je parkiranje plaćeno

- Izdavanje i ispis dnevne parkirne karte

Aplikacija je native Android aplikacija pisana u Kotlin-u. Sve provjere u aplikaciji vrše se on-line pozivom odgovarajućih EndPoint-ova WebAPI-a.

**Sigurnost**

Svi pozivi na WebAPI moraju ići preko HTTPS protokola s API-KEY-em u headeru requesta. API-KEY mora postojati u softlab_serials ili softlab_serials_test bazi podataka ako se radi o DEMO verziji. Također se koristi i JWT token za pristup svim ostalim endpointovima osim Login

**Korisničko sučelje sastoji se od slijedećih glavnih Activity-a:**

- Launcher Activity

- Login Activity

- Main Activity

- ANPR Activity

- Ostali activity po potrebi

**Launcher Activity**

Activity koji služi samo kao „splash-screen“. Nakon što se animacija završi nakon 1 sec radi se redirekcija na Login Activity.

XML Layout Launchera:

\<androidx.constraintlayout.widget.ConstraintLayout

    xmlns:android="http://schemas.android.com/apk/res/android"

    xmlns:app="http://schemas.android.com/apk/res-auto"

    android:layout_width="match_parent"

    android:layout_height="match_parent"

    android:background="@drawable/splash_background"\>

    \<ImageView

        android:id="@+id/logo"

        android:layout_width="140dp"

        android:layout_height="140dp"

        android:src="@drawable/spark_logo"

        android:scaleType="fitCenter"

        app:layout_constraintTop_toTopOf="parent"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintEnd_toEndOf="parent"

        android:layout_marginTop="60dp" /\>

    \<TextView

        android:id="@+id/txtSpark"

        android:layout_width="wrap_content"

        android:layout_height="wrap_content"

        android:text="SPARK"

        android:textStyle="bold"

        android:textSize="48sp"

        android:textColor="@android:color/white"

        app:layout_constraintTop_toBottomOf="@id/logo"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintEnd_toEndOf="parent" /\>

    \<TextView

        android:id="@+id/txtInspector"

        android:layout_width="wrap_content"

        android:layout_height="wrap_content"

        android:text="INSPECTOR"

        android:textSize="22sp"

        android:textColor="#2196F3"

        app:layout_constraintTop_toBottomOf="@id/txtSpark"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintEnd_toEndOf="parent" /\>

    \<TextView

        android:id="@+id/txtSubtitle"

        android:layout_width="wrap_content"

        android:layout_height="wrap_content"

        android:text="Sustav za naplatu parkiranja"

        android:textSize="18sp"

        android:textColor="@android:color/white"

        app:layout_constraintTop_toBottomOf="@id/txtInspector"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintEnd_toEndOf="parent"

        android:layout_marginTop="12dp" /\>

    \<com.airbnb.lottie.LottieAnimationView

        android:id="@+id/lottieView"

        android:layout_width="280dp"

        android:layout_height="280dp"

        app:lottie_rawRes="@raw/parking_animation"

        app:lottie_autoPlay="true"

        app:lottie_loop="true"

        app:layout_constraintTop_toBottomOf="@id/txtSubtitle"

        app:layout_constraintBottom_toTopOf="@id/txtLoading"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintEnd_toEndOf="parent" /\>

    \<TextView

        android:id="@+id/txtLoading"

        android:layout_width="wrap_content"

        android:layout_height="wrap_content"

        android:text="Pokretanje aplikacije..."

        android:textColor="#2196F3"

        android:textSize="16sp"

        android:layout_marginBottom="50dp"

        app:layout_constraintBottom_toBottomOf="parent"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintEnd_toEndOf="parent" /\>

\</androidx.constraintlayout.widget.ConstraintLayout\>

\<!-- res/drawable/splash_background.xml --\>

\<shape xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<gradient

        android:startColor="#03112D"

        android:endColor="#001A45"

        android:angle="270" /\>

\</shape\>

**Login Activity**

Login activity služi kako bi se kontrolor prijavio u sustav. Prijava se vrši unosom PIN-a koji može biti samo broj do maksimalno 4 znaka (od 0-9). Nakon unosa PINa kontrolor pritiskom na tipku „Prijava“ inicira poziv WebAPI EndPointa „Login“ koji provjerava tablicu dbo.INSPECTORS da li taj PIN postoji te da li je kontrolor aktivan. Ako kontrolor nije aktivan ili PIN ne postoji javlja se poruka „Pogrešno upisan PIN ili korisnik nije aktivan. Molim pokušajte ponovo.“. Nakon poruke se poništava PIN upisan u TextView. Sadržaj PINa u TextViewu je nečitljiv (prikazuju se točkice umjesto znakova) ali postoji mogućnost prikaza PINa klikom na button). PIN se vidi samo dok je button pritisnut. Čim se button pusti PIN ponovo postaje nečitljiv.

Ako je upisani PIN ispravan i kontrolor aktivan radi se redirekcija na MainActivity.

NE DA

Primjer ekrana za login putem PINa:

**MainActivity**

Na ovom Activityu se prikazuju opcije za provjeru tablica i button „Odjava“. Ovo je glavni activity iz kojeg se pokreću ostale akcije.

**Dostupne opcije:**

- Očitaj tablicu (ANPR)

- Upiši registarsku oznaku vozila

- Izgovori registarsku oznaku vozila

- Odjava

Sve opcije osim jedne imaju istu svrhu: kontrola da li je parkirna karta kupljena i da li je još unutar vremena. Opcija Odjava služi za odjavu korisnika i povratak na LoginActivity.

Osim buttona u vrhu ekrana treba biti prikazan i naziv komunalnog poduzeća te ime i prezime kontrolora koji je prijavljen. Naziv poduzeća treba biti istaknut.

Primjer izgleda Main ekrana:

**Očitaj tablicu (ANPR)**

Prikazuje ANPRActivity koji aktivira stražnju kameru Androida i iscrtava u sredini kvadrat u kojem se mora nalaziti tablica vozila koju skeniramo. Aplikacija automatski prepoznaje tablicu i po prepoznavanju i Intentom šalje očitane podatke i zatvara se te radi redirekciju na MainActivity koji onda obrađuje podatke i vrši poziv prema WebAPIju za provjeru „check“. Nakon provjere prikazuje dijalog sa rezultatom provjere. Postupak i kod nalazi se niže u dokumentu i treba ga prilagoditi sučelju. Također je omogućeno odustajanje od očitanja i vraćanje na MainActivity.

Primjer izgleda ekrana:

**Upiši registarsku oznaku vozila**

Prikazuje dijalog sa EditViewom u koji se ručno preko on-screen tipkovnice upisuje registarska oznaka (bez razmaka i crtica, samo slova i brojke). Na dijalogu se nalaze dva buttona:

- Potvrdi

- Odustani

Button potvrdi pokreće isti proces kao i nakon što ANPR prepozna tablicu, odnosno Intentom šalje upisane podatke i zatvara se te radi redirekciju na MainActivity koji onda obrađuje podatke i vrši poziv prema WebAPIju za provjeru „check“. Dalje preuzima MainActivity kao i u slučaju ANPR.

Primjer izgleda ekrana:

**Izgovori registarsku oznaku vozila**

Klik na ovaj button omogućuje kontrolru da izgovori broj registarske oznake u mikrofon mobitela. Za to ćemo korstiti ugrađen google Speech To Text te AI koji će pretvoriti izgovoren ZE-GE u ZG te pročistiti tekst od razmaka i crtica. Zatim pokreće isti proces kao i ANPR i ručni upis rade.

Primjer izgleda ekrana:

**Postupak provjere**

Pročišćena registarska oznaka (bez razmaka i crtica) šalje se na WebAPI „check“. Sustav provjerava u spark_work radnoj bazi podataka slijedećim redoslijedom:

> 1\. Da li ta reg. Oznaka postoji upisana u tablici PRIVILEGED_OWNERS te da li još važi. U koliko pronađe zapis ne provjerava dalje i smatra da je karta kupljena.
>
> 2\. Da li ta reg oznaka postoji upisana u tablici TICKETS.

| Rezultat upita                           | Da li je karta OK?            |
|------------------------------------------|-------------------------------|
| Zapis je pronađen, VivaStatus=“DONE“     | Smatra da je karta kupljena   |
| Zapis je pronađen, VivaStatus \<\>“DONE“ | Smatra da karta NIJE Kupljena |
| Zapis nije pronađen                      | Smatra da karta NIJE Kupljena |

**Upit za provjeru PRIVILEGED_OWNERS**

SELECT

PrivilegedOwnerId,

TenantId,

VehicleRegistration,

ValidUntil,

OwnerName,

Address,

HouseNo,

ZipCode,

City,

CreatedAt,

UpdatedAt

FROM dbo.PRIVILEGED_OWNERS

WHERE VehicleRegistration = @VehicleRegistration AND TenantId = @tenantId

AND ValidUntil \>= SYSUTCDATETIME() ;

**Upit za provjeru TICKETS**

SELECT TOP (1)

TicketId,

TransactionId,

TenantId,

TicketTypeId,

VehicleRegistration,

ZoneId,

ParkingMinutes,

Amount,

CreatedAt,

ValidUntil,

PhoneNumber,

VivaStatus,

FiscalStatus,

JIR,

ZKI,

CASE WHEN VivaStatus = 'DONE' THEN 'Kartica autorizirana.' ELSE 'Kartica nije autorizirana.' END as \[Status\]

FROM dbo.TICKETS

WHERE TenantId = @TenantId

AND VehicleRegistration = @VehicleRegistration

ORDER BY ValidUntil DESC;

U oba slučaja i kad je karta OK i kad nije prikazuje se dijalog s rezultatom kontrole te slijedećim opcijama:

Button „U redu“ na dnu dijaloga se prikazuje uvijek. On samo zatvara dijalog i omogućuje ponovnu provjeru tog ili neke drugog vozila.

Ako kontrola nije prošla prikazuje se:

- Izdaj dnevnu parkirnu kartu. Button je enablean samo ako je prošlo 15 minuta od prvog zapažanja vozila.

- Ispiši dnevnu parkirnu kartu (ako je dnevna karta za tu reg. oznaku već izdana). Button Izdaj dnevnu kartu je u ovom slučaju disablean.

Postoje dvije varijante ekrana kad je parkiranje u redu i to su:

1.  Povlašteni parking.

2.  Prijavljeno parkiranja unutar vremena.

Postoje tri varijante ekrana kad parkiranje nije važeće i to su:

1.  Parkiranje nije prijavljeno.

2.  Pakriranje je prijavljeno ali nije prošla kartica (nije plaćeno).

3.  Parkiranje je isteklo.

Sve tri varijante dolaze u dvije podvarijante. Ako nije izdana dnevna karta i ako je izdana dnevna karta. Uvijek se prikazuje samo jedan od ta dva buttona a ovisi o tome da li je dnevna karta već izdana ili nije.

Ekrani kad parkiranje uopće nije prijavljeno na sustav:

Ekrani kad je parkiranje prijavljeno ali nije prošla autorizacija kartice:

Ekrani kad je isteklo važeće parkiranje:

Dijagram toka operacija kod provjere parkiranja

Primjer dijaloga koji se otvara na klik „IZDAJ DNEVNU PAKRIRNU KARTU“:

- Zona se automatski postavlja na zonu kupljene karte. Ako karta nije kupljena odabire se.

- Klik na „U redu“ zove WebAPI koji kreira novu dnevnu parkirnu kartu i automatski je ispisuje.

- Kontrolor mora određeni broj puta slikati vozilo prije nego se button U REDU enablea. Taj broj se definira na nivou grada (npr. obavezno 3 slike).

- Klik na Odustani zatvara dijalog i ne radi ništa.

WebAPI (Backend)

WebAPI je srce sustava i omogućava rad svim komponentama sustava. Koriste ga

- SPARK Admin – klijentska aplikacija koju koriste gradovi za administraciju i izvještavanje

- SPARK Inspector – Android aplikacija za provjeru parkiranja i izdavanje dnevnih karata

- SPARK Bot – Komunikacija između WhatsApp poruka i sustava

WebAPI treba biti podijeljen na tri controllera od kojih svaki Controller brine za svoj modul:

1.  AdminController

2.  InspectorController

3.  WappController

WebAPI je programiran u c# .NET Core 8 ili veći. WepAPI ju se pristupa isključivo putem HTTPSa a AdminController i InspectorController još dodatno putem API-KEYa.  
WappController služi za komunikaciju WhatsApp – API pa ne možemo koristiti API key ali validiramo WhatsApp request (header X-Hub-Signature-256).

**AdminController**

Upravlja podacima backofficea i omogućuje rad SPARK Admin klijentima. Sadrži više controllera, za svaki objekt po jedan:

- TicketController. Pregled i izvještavanje običnih park. Karata.

- DPKController. Pregled, izdavanje, naknadna fiskalizacija i izvještavanje o dnevnim parkirnim kartama.

- InspectorController. Pregled i uređivanje korisnika SPARK Inspector aplikacije (kontrolora).

- PrivilegeControler. Pregled i uređivanje povlaštenih korisnika parkiranja (stanari i sl.)

- ZoneController. Pregled i uređivanje zona parkiranja.

- TenantController. Pregled i uređivanje podataka o gradu .

- AdminController. Pregled i uređivanje podataka o korisnicima BackOffice aplikacije.

**SparkInspectorController (SPARK Inspector)**

Omogućuje provjeru naplate parkiranja SPARK Inspector aplikaciji te izdavanje dnevnih parkirnih karata. Sastoji se od četiri EndPointa:

1.  Login. Omogućuje kontroloru prijavu u aplikaciju putem PINa.

2.  Check. Provjerava da li je zadana registartska oznaka prijavila parkiranje.

3.  IssueDPK. Izdaje dnevnu parkirnu kartu. Ako je parkiranje uredno u trenutku pokušaja izdavanja DPKa javlja grešku „Dnevnu parkirnu kartu nije moguće izdati jer je vozilo \<reg oznaka\> uredno prijavilo parkiranje u zoni ZONA2 koje vrijedi do 12:35“

4.  GetDPK. Vraća podatke o dnevnoj parkirnoj karti ako je izdana.

**Rate Limiter**

Kako bi onemogućili da nam netko brute forcea EndPointe uključit ćemo Rate Limiter. Za sad samo Login EndPoint će koristiti taj rate limiter. Rate limiter će dozvoliti 5 requesta u minuti po IP adresi. To se radi kroz program.cs

Program.cs koji uključuje Rate limiter:

using Microsoft.AspNetCore.RateLimiting;

using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ============================================================

// CONTROLLERI

// ============================================================

builder.Services.AddControllers();

// ============================================================

// RATE LIMITER

// ============================================================

builder.Services.AddRateLimiter(options =\>

{

    // Status koji vraćamo kada je prekoračen limit

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Policy koja će se koristiti samo na Login endpointu

    options.AddPolicy("LoginPolicy", httpContext =\>

    {

        // Dohvati IP adresu uređaja koji pokušava napraviti login

        string ipAddress =

            httpContext.Connection.RemoteIpAddress?.ToString()

            ?? "unknown";

        // Svaka IP adresa ima svoj zaseban limiter

        return RateLimitPartition.GetFixedWindowLimiter(

            partitionKey: ipAddress,

            factory: \_ =\> new FixedWindowRateLimiterOptions

            {

                // Maksimalno 5 pokušaja

                PermitLimit = 5,

                // Unutar jedne minute

                Window = TimeSpan.FromMinutes(1),

                // Ne čekamo u redu ako je limit dosegnut

                QueueLimit = 0,

                // Automatski započni novi prozor

                AutoReplenishment = true

            }

        );

    });

});

var app = builder.Build();

// ============================================================

// MIDDLEWARE

// ============================================================

app.UseHttpsRedirection();

// Omogući Rate Limiter middleware

app.UseRateLimiter();

app.UseAuthorization();

app.MapControllers();

app.Run();

**X-API-KEY Autorizacija**

Aplikacije koje koriste WebAPI moraju u headeru poslati API-KEY dodijeljen od Softlaba. API-KEY se šalje kroz header requesta kroz X-API-KEY parametar. Ovime osiguravamo da je aplikacija instalirana s našom dozvolom i možemo provjeriti da li je API-KEY valjan ili nije te da li je licenca plaćena ili nije. Provjeru ćemo osigurati kroz custom atribut.

Klasa koja implementira custom artibut za provjeru API-KEYa

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Mvc.Filters;

public class ApiKeyAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter

{

    public async Task OnAuthorizationAsync(

        AuthorizationFilterContext context)

    {

        // Dohvati API key iz headera

        if (!context.HttpContext.Request.Headers.TryGetValue(

                "X-API-KEY",

                out var apiKey))

        {

            context.Result = new UnauthorizedObjectResult(

                "API key nije poslan."

            );

            return;

        }

        // Dohvati servis iz baze

        bool isValid = await apiKeyService.IsValidAsync(

            apiKey.ToString()

        );

        if (!isValid)

        {

            context.Result = new UnauthorizedObjectResult(

                "Neispravan API key."

            );

        }

    }

}

Nakon ovog Controlleri InspectorController i AdminController moraju biti definirani ovako:

\[ApiKeyAuthorize\]

\[Authorize\]

\[ApiController\]  
\[Route("api/v1/\[controller\]")\]  
public class InspectorController : ControllerBase

{

}

\[ApiKeyAuthorize\]

\[Authorize\]

\[ApiController\]  
\[Route("api/v1/\[controller\]")\]  
public class AdminController : ControllerBase

{

}

**JWT Security token**

Nakon uspješnog logina kreira se JWT token koji u sebi sadrži TenantId (id grada) i InspectorId(Id kontrolora). Svi endpointovi koji se zovu sa SPARK Inspector aplikacije moraju u svom headeru kroz Authorization: Bearer poslati taj token.

Kasnije se u endpointovima može doći do tih podataka na slijedeći način:

var tenantId = User.FindFirst("TenantId")?.Value;

var inspectorId = User.FindFirst("InspectorId")?.Value;

Funkcija za generiranje JWT tokena koji traje 10h:

using System.IdentityModel.Tokens.Jwt;

using System.Security.Claims;

using System.Text;

using Microsoft.IdentityModel.Tokens;

private string GenerateToken(Inspector inspector)

{

    var claims = new\[\]

    {

        new Claim("InspectorId", inspector.InspectorId.ToString()),

        new Claim("TenantId", inspector.TenantId.ToString()),

        new Claim(ClaimTypes.Name, \$"{inspector.Name} {inspector.Surname}")

    };

    var key = new SymmetricSecurityKey(

        Encoding.UTF8.GetBytes(Configuration\["Jwt:Key"\])

    );

    var credentials = new SigningCredentials(

        key,

        SecurityAlgorithms.HmacSha256

    );

    var token = new JwtSecurityToken(

        issuer: "SPARK",

        audience: "SPARK_INSPECTOR",

        claims: claims,

        expires: DateTime.UtcNow.AddHours(10),

        signingCredentials: credentials

    );

    return new JwtSecurityTokenHandler().WriteToken(token);

}

Program.cs za JWT tokene:

using Microsoft.AspNetCore.Authentication.JwtBearer;

using Microsoft.IdentityModel.Tokens;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtKey = builder.Configuration\["Jwt:Key"\];

builder.Services

    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

    .AddJwtBearer(options =\>

    {

        options.TokenValidationParameters = new TokenValidationParameters

        {

            ValidateIssuer = true,

            ValidIssuer = "SPARK",

            ValidateAudience = true,

            ValidAudience = "SPARK_INSPECTOR",

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(

                Encoding.UTF8.GetBytes(jwtKey!)

            )

        };

    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

**Login**

Služi za autentikaciju kontrolora u SPARK Inspector aplikaciju. Samo prijavljeni kontrolor može koristiti aplikaciju. Funkciji se šalje TenantId (ID grada) i upisani PIN. WebAPI vraća podatke o prijavljenom kontroloru ili NULL ako kontrolor nije pronađen. Aplikacija ne dozvoljava prelazak na MainActivity dok god se kontrolor ne prijavi u sustav. Obavezno u controller dodati RateLimiter na 5 zahtjeva po IP adresi u minuti.

Login funkcija koja dodaje JWT token:

\[HttpPost\]  
\[AllowAnonymous\]  
\[EnableRateLimiting("LoginPolicy")\]  
\[Route("login")\]

public async Task\<IActionResult\> Login(\[FromBody\] LoginRequest request)

{

    var inspector = await db.GetInspectorByPin(

        request.TenantId,

        request.PIN

    );

    if (inspector == null)

    {

        return Unauthorized();

    }

    var token = GenerateToken(inspector);

    return Ok(new

    {

        token = token,

        inspector = new

        {

            inspector.InspectorId,

            inspector.TenantId,

            inspector.Name,

            inspector.Surname

        }

    });

}

Klasa LoginRequest:

public class LoginRequest

{

    public int TenantId { get; set; }

    public string PIN { get; set; }

}

Klasa Inspector:

public class Inspector

{

    public int InspectorId { get; set; }

    public int TenantId { get; set; }

    public string Oib { get; set; }

    public string Name { get; set; }

    public string Surname { get; set; }

    public string Pin { get; set; }

    public bool IsActive { get; set; }

}

**Check**

Funkcija Check provjerava da li je zadana registarska oznaka vozila platila parkirnu kartu (ili je možda povlašten vlasnik) ili karta nije plaćena. Vraća podatke o plaćanju parkiranja. Funkcija prima registarsku oznaku vozila pročišćenu od svih razmaka i crtica i znakova. Na primjer oznaka na tablici vozila ZG 5545 AI se treba poslati kao ZG5545AI.

Potpis funkcije:

\[HttpPost\]  
\[Authorize\]  
\[Route("check")\]

public async Task\<IHttpActionResult\> Check(\[FromBody\] CheckRequest request)

CheckRequest:

public class CheckRequest

{

    public string LicensePlate { get; set; }

}

ParkingCheckResult

public class ParkingCheckResult

{

    public string Status { get; set; }

public string StatusColor { get; set; }

public string Owner { get; set; }

    public string LicensePlate { get; set; }

    public string Zone { get; set; }

    public DateTime? ValidUntil { get; set; }

public DateTime? dateFirstObserved { get; set; }

    public int OverageMinutes { get; set; }

    public bool DailyTicket { get; set; }

    public Guid? TicketId { get; set; }

}

Provjera prvo gleda u PRIVILEGED_OWNERS da li postoji povlašteni vlasnik upisan i da li mu vrijedi povlaštenje (ValidUntil \>= SYSUTCDATETIME()).

Ako postoji ne gleda dalje nego samo vraća podatke:

{

  "status": "POVLAŠTENO PAKRIRANJE",

"statusColor": "Green",

  "owner": "Ivan Horvat",

  "licensePlate": "ZG4457IA",

  "zone": "ZONA2",

  "validUntil": "2026-08-23T15:45:00",

  "overageMinutes": null,

  "dailyTicket": null,

  "ticketId": null

}

Ako ne postoji povlašteni vlasnik onda gleda u tablicu TICKETS da li postoji ticket s tom registarskom oznakom kojoj je ValidUntil\>= SYSUTCDATETIME()

Ako postoji a overageMinutes vrati \<= 0 vraća slijedeće podatke:

{

  "status": "PARKIRANJE VAŽEĆE",

"statusColor": "Green",

  "owner": null,

  "licensePlate": "ZG4457IA",

  "zone": "ZONA1",

  "validUntil": "2026-08-23T15:45:00",

  "overageMinutes": 0,

  "dailyTicket": false,

  "ticketId": 0A011F4B-80C5-454F-A332-A7068D796584

}

Ako postoji a overageMinutes vrati \>0 vraća slijedeće podatke:

{

  "status": "PARKIRANJE ISTEKLO",

"statusColor": "Red",

  "owner": null,

  "licensePlate": "ZG4457IA",

  "zone": "ZONA1",

"dateFirstObserved": "2026-08-23T14:45:00",

  "validUntil": "2026-08-23T15:45:00",

  "overageMinutes": 15,

  "dailyTicket": false,

  "ticketId": 0A011F4B-80C5-454F-A332-A7068D796584

}

Ako postoji a autorizacija kartice nije prošla vraća slijedeće podatke:

{

  "status": "PARKIRANJE NIJE PLAĆENO",

"statusColor": "Red",

  "owner": null,

  "licensePlate": "ZG4457IA",

  "zone": "ZONA1",

  "validUntil": "2026-08-23T15:45:00",

"dateFirstObserved": "2026-08-23T14:45:00",

  "overageMinutes": 15,

  "dailyTicket": false,

  "ticketId": 0A011F4B-80C5-454F-A332-A7068D796584

}

Ako ne postoji u TICKET tablici vraća slijedeće podatke:

{

  "status": "PARKIRANJE NIJE PRIJAVLJENO",

"statusColor": "Red",

  "owner": null,

  "licensePlate": "ZG4457IA",

  "zone": "ZONA1",

  "validUntil": "2026-08-23T15:45:00",

"dateFirstObserved": "2026-08-23T14:45:00",

  "overageMinutes": 15,

  "dailyTicket": false,

  "ticketId": 0A011F4B-80C5-454F-A332-A7068D796584

}

Ako je status „PARKIRANJE NIJE PLAĆENO“ ili „PARKIRANJE NIJE PRIJAVLJENO“ ili „PARKIRANJE ISTEKLO“ onda se dodaje i zapis u tablicu PARKING_OBSERVATIONS s tom registarskom oznakom i trenutnim datumom i vremenom kad je vozilo opaženo te ID em kontrolora i TenantID-em. Ovo se radi samo prvi puta kod opažanja. Iduća provjera više ne dodaje zapis u tablicu ako on već postoji.

U koliko podatak dailyTicket bude true to znači da je za te registarske oznake već izdana dnevna parkirna karta te na interfaceu aplikacije umjesto buttona „IZDAJ DNEVNU PARKIRNU KARTU“ prikazujemo button „ISPIŠI DNEVNU PARKIRNU KARTU“

  "dailyTicket": true,

Opis strukture JSON podataka:

<table>
<colgroup>
<col style="width: 23%" />
<col style="width: 14%" />
<col style="width: 62%" />
</colgroup>
<thead>
<tr class="header">
<th>Podatak</th>
<th>Tip</th>
<th>Opis</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td>status</td>
<td>String</td>
<td><p>Opis statusa plaćenosti.</p>
<p>Može biti:</p>
<ul>
<li><p>POVLAŠTENO PAKRIRANJE. Vlasnik vozila ima povlašteno parkiranje toj zoni.</p></li>
<li><p>PARKIRANJE VAŽEĆE. Vlasnik vozila je uredno platio parkiranje koje još nije isteklo.</p></li>
<li><p>PARKIRANJE ISTEKLO. Vlasnik vozila je uredno platio parkiranje ali je prekoračio dozvoljeno vrijeme parkiranja.</p></li>
<li><p>PARKIRANJE NIJE PLAĆENO. Vlasnik vozila u trenutku provjere je prijavio parkiranje ali terećenje kartice nije prošlo pa parkiranje nije plaćeno.</p></li>
<li><p>PARKIRANJE NIJE PRIJAVLJENO. Vlasnik vozila u trenutku provjere nije prijavio parkiranje.</p></li>
</ul></td>
</tr>
<tr class="even">
<td>statusColor</td>
<td>String</td>
<td>Boja prikaza slova na ekranu (hex)</td>
</tr>
<tr class="odd">
<td>owner</td>
<td>String</td>
<td>Ime i prezime vlasnika ako se radi o povlašetnom parkiranju.</td>
</tr>
<tr class="even">
<td>licensePlate</td>
<td>String</td>
<td>Registarska oznaka vozila kako je kontrolor upisao.</td>
</tr>
<tr class="odd">
<td>Zone</td>
<td>Strring</td>
<td>Naziv zone u kojoj se vozilo nalazi</td>
</tr>
<tr class="even">
<td>validUntil</td>
<td>DateTime</td>
<td>Datum i vrijeme do kad parkiranje vrijedi.</td>
</tr>
<tr class="odd">
<td>dateFirstObserved</td>
<td>DateTime</td>
<td>Datum i vrijeme kad je kontrolor prvi puta opazio vozilo. Može biti null</td>
</tr>
<tr class="even">
<td>overageMinutes</td>
<td>int</td>
<td>Broj minuta prekoračenja parkiranja. Može biti negativna vrijednost ako je parkiranje još važeće.</td>
</tr>
<tr class="odd">
<td>dailyTicket</td>
<td>bool</td>
<td>Da li je naplaćena dnevna parkirna karta ili ne.</td>
</tr>
<tr class="even">
<td>tickedId</td>
<td>GUID</td>
<td>ID ticketa dnevne parkirne karte ili parkirne karte.</td>
</tr>
</tbody>
</table>

**IssueDPK**

Ova funkcija služi za izdavanje dnevne parkirne karte za određeno vozilo. Nije moguće izdati dvije dnevne parkirne karte za istu registarsku oznaku vozila u istom danu. Kad se prvi puta izda ona vrijedi iduća 24 sata. Funkcija prima parametre LicensePlate i ostale parametre a vraća podatke o DPK u u klasi DailyTicket. Dnevna parkirna karta može se izdati samo nakon što je kontrolor evidentirao prvo opažanje vozila te je prošlo barem 15 minuta od prvog opažanja. Prilikom izdavanja dnevne parkirne karte kontrolor je obavezan upisati broj parkirne karte (pročita ga sa uplatnice koja je unaprijed printana ili očitati barcode oznaku sa uplatnice a app će iz poziva na broj izvuči broj parkirne karte) odbabrati zonu u kojoj se vozilo nalazi te odabrati marku vozila (tipa Citroen) i upisati adresu gdje je zatekao vozilo. Dnevna parkirna karta ne može biti izdana ako nisu priložene slike vozila (min. broj je definiran na niovu Grada).

Potpis funkcije:

\[HttpPost\]  
\[Authorize\]  
\[Route("issue-dpk")\]

public async Task\<IHttpActionResult\> IssueDPK(

    \[FromBody\] IssueDPKRequest request)

IssueDPKRequest

public class IssueDPKRequest

{

    public string LicensePlate { get; set; }

    public string Zone { get; set; }

}

DailyTicket

public class DailyTicket

{

    public Guid TicketId { get; set; }

    public long TransactionId { get; set; }

    public int TenantId { get; set; }

public int InspectorId { get; set; }

    public int TicketTypeId { get; set; }

    public string VehicleRegistration { get; set; }

public string VehicleCountryCode { get; set; }

public string Address { get; set; }

    public int ZoneId { get; set; }

    public int ParkingMinutes { get; set; }

    public decimal Amount { get; set; }

    public decimal Osnovica { get; set; }

    public decimal StopaPDV { get; set; }

    public decimal IznosPDV { get; set; }

    public int InvoiceNo { get; set; }

    public string PremisesCode { get; set; }

    public string CashRegisterCode { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime ValidUntil { get; set; }

    public string PhoneNumber { get; set; }

    public string WhatsAppMessageId { get; set; }

    public string VivaStatus { get; set; }

    public int VivaRetryCount { get; set; }

    public DateTime? VivaProcessingAt { get; set; }

    public string VivaTransactionId { get; set; }

    public string VivaLastError { get; set; }

    public DateTime? VivaAuthorizedAt { get; set; }

    public string FiscalStatus { get; set; }

    public int FiscalRetryCount { get; set; }

    public DateTime? FiscalProcessingAt { get; set; }

    public string FiscalReceiptNumber { get; set; }

    public string JIR { get; set; }

    public string ZKI { get; set; }

    public string FiscalLastError { get; set; }

    public DateTime? FiscalizedAt { get; set; }

    public string CentralStatus { get; set; }

    public int CentralRetryCount { get; set; }

    public DateTime? CentralProcessingAt { get; set; }

    public string CentralLastError { get; set; }

    public DateTime? TransferredAt { get; set; }

    public DateTime UpdatedAt { get; set; }

}

- Kod kreiranja DPKa za TicketTypeId = 2 (Dnevna), a cijena se koristi iz podatka DailyTicketPrice iz tablice ZONES.

- Osigurati da se ne upišu dvije DPK za isti dan i istu reg. oznaku vozila. Baciti Exception.

- Osigurati da su sve portebne slike priložene.

- Nakon uspješnog upisa pokreće se autorizacija i naplata kartice.

- Nakon naplate pokreće se fiskalizacija. Na kraju se vraća DailyTicket

**GetDPK**

Funkcija vraća podatke o dnevnoj parkirnoj karti ili null ako ona ne postoji. Funkcija prima parametar TicketId a vraća DailyTicket.

Potpis funkcije

\[HttpPost\]  
\[Authorize\]  
\[Route("get-dpk")\]

public async Task\<IHttpActionResult\> GetDPK(\[FromBody\] GetDPKRequest request)

GetDPKRequest

public class GetDPKRequest

{

    public Guid TicketId { get; set; }

}

Funkcija vraća DailyTicket:

{

  "ticketId": "6f8b7f1a-4c9b-4e5b-9b8d-123456789abc",

  "transactionId": 123456,

  "tenantId": 15,

"InspectorId": 1,

  "ticketTypeId": 2,

  "vehicleRegistration": "ZG4457IA",

"vehicleCountryCode": "HR",

"address": "Ljudevita Gaja 20",

  "zoneId": 3,

  "parkingMinutes": 1440,

  "amount": 15.00,

  "osnovica": 12.00,

  "stopaPDV": 25.00,

  "iznosPDV": 3.00,

  "invoiceNo": 202600123,

  "premisesCode": "PP-ZG-01",

  "cashRegisterCode": "BLAG1",

  "createdAt": "2026-08-23T14:30:00.123",

  "validUntil": "2026-08-23T23:59:59.000",

  "phoneNumber": null,

  "whatsAppMessageId": "",

  "vivaStatus": "OK",

  "vivaRetryCount": 0,

  "vivaProcessingAt": null,

  "vivaTransactionId": "VIVA-20260823-123456",

  "vivaLastError": null,

  "vivaAuthorizedAt": "2026-08-23T14:30:05.321",

  "fiscalStatus": "OK",

  "fiscalRetryCount": 0,

  "fiscalProcessingAt": null,

  "fiscalReceiptNumber": "FISK-2026-001234",

  "jir": "JIR-ABC123456",

  "zki": "ZKI-987654321",

  "fiscalLastError": null,

  "fiscalizedAt": "2026-08-23T14:30:06.100",

  "centralStatus": "OK",

  "centralRetryCount": 0,

  "centralProcessingAt": null,

  "centralLastError": null,

  "transferredAt": "2026-08-23T14:30:10.500",

  "updatedAt": "2026-08-23T14:30:10.500"

}

Primjer ispisa DPK:

**WappController**

Omogućuje dvosmjernu komunikaciju sa WhatsApp API-em te omogućuje zaprimanje zahtjeva za parkiranjem.

Dohvat podataka o vlasniku vozila

Za potrebe izdavanja DPK-a potrebno je imati podatke o vlasniku vozila u slučaju da se DPK ne plati. Za provjeru tih podataka potrebno je imati certifikat i VPN prema MUP serveru. Za potrebe razvoja sustava potrebno je napraviti mock (lažni) endpoint koji će vraćati dummy podatke. WebAPI prima kao ulazni podatak registarsku oznaku vozila. Podaci o vlasniku nisu dostupni kontroloru na mobilnoj aplikaciji već ih naš BackEnd sustav upisuje prilikom upisa dnevne parkirne karte. Backend treba biti postavljen tako da u slučaju neuspjelog prvog dohvata pokušava ponovo x puta.

Za pristup podacima MUPa biti će potreban certifikat koji je grad dobio od MUPa i VPN pristup te također možda i poslati gradu IP adresu našeg servera da ga oni proslijede MUPu. Certifikat i lozinka se u bazu podataka obavezno moraju spremati u enkriptiranom obliku sa ključem koji je spremljen u Windows System Environment varjiablu „SPARK_ENCRIPTION_KEY“

JSON koji moc WebAPI endpoint vraća:

{

  "status": "OK",

  "registracija": "ZG1234AA",

  "broj_sasije": "WBA1A110X0XXXXXXX",

  "vlasnik": {

    "tip_osobe": "FIZICKA",

    "ime": "Ivan",

    "prezime": "Horvat",

    "oib": "12345678901",

    "adresa": "Ilica 1",

    "grad": "Zagreb",

    "postanski_broj": "10000"

  },

  "korisnik_leasinga": {

    "postoji": true,

    "tip_osobe": "PRAVNA",

    "naziv_tvrtke": "Abc Leasing d.o.o.",

    "oib": "98765432109",

    "adresa": "Slavonska avenija 10",

    "grad": "Zagreb",

    "postanski_broj": "10000"

  }

}

Podsustav za prepoznavanje registarskih oznaka vozila (ANPR)

**1. Sažetak podsustava**

Ovaj modul unutar Android aplikacije omogućuje **automatsko prepoznavanje registarskih pločica (ANPR)** u stvarnom vremenu (real-time) izravno putem video streama s kamere uređaja. Sustav detektira tekstualne regije na registarskim pločicama vozila, vrši optičko prepoznavanje znakova (OCR), validira formate prema zadanim regularnim izrazima (Regex) te detektirani rezultat ispisuje na korisničko sučelje (TextView) bez potrebe za interakcijom korisnika (npr. bez pritiska na gumb za slikanje).

**2. Arhitektura sustava i tehnološki stog**

Sustav je razvijen u jeziku **Kotlin** i oslanja se na arhitekturu obrade na samom uređaju što osigurava rad bez mrežne latencije (offline rad) i visoku razinu privatnosti podataka.

- **Programski jezik:** Kotlin

- **Minimalni Android SDK:** API 21 (Android 5.0) ili noviji

- **Podsustav za kameru:** androidx.camera:camera-view (CameraX API)

- **OCR / Detekcija teksta:** com.google.mlkit:play-services-mlkit-text-recognition (Google ML Kit)

**Dijagram tijeka podataka (Data Flow)**

1.  **Kamera (CameraX)** dohvaća video okvire (Frames) u stvarnom vremenu.

2.  **ImageAnalysis.Analyzer** presreće najnoviji dostupni okvir i prosljeđuje ga ML Kit podsustavu.

3.  **ML Kit Text Recognition** analizira sliku i vraća strukturirani tekstualni objekt (VisionText).

4.  **Biznis logika (Regex)** filtrira i validira prepoznati tekst.

5.  **UI Thread** ažurira tekstualnu komponentu (TextView) ako je valjana pločica detektirana.

**3. Implementacijski detalji i konfiguracija**

**3.1. Konfiguracija Gradle ovisnosti (build.gradle.kts)**

Za ispravan rad modula potrebno je unutar dependencies bloka definirati CameraX biblioteke koje apstrahiraju rad s hardverom te ML Kit zadužen za strojno učenje i OCR.

// Google ML Kit Text Recognition (Latinsko pismo)

// implementation("com.google.android.gms:play-services-mlkit-text-recognition:19.0.0") // CameraX jezgra i komponente sučelja val cameraxVersion = "1.3.4"

// implementation("androidx.camera:camera-core:\$cameraxVersion")

// implementation("androidx.camera:camera-camera2:\$cameraxVersion")

// implementation("androidx.camera:camera-lifecycle:\$cameraxVersion")

// implementation("androidx.camera:camera-view:\$cameraxVersion")

**3.2. Upravljanje dopuštenjima (Permissions)**

Aplikacija zahtijeva pristup hardverskoj kameri. Dopuštenje se deklarira u AndroidManifest.xml datoteci te se obavezno provjerava u vremenu izvršavanja (Runtime Permission).

\<uses-permission android:name="android.permission.CAMERA" /\>

\<uses-feature android:name="android.hardware.camera" /\>

**4. Ključne komponente koda (Code Architecture)**

**4.1. Analizator okvira slike: PlateAnalyzer.kt**

Ova klasa implementira sučelje ImageAnalysis.Analyzer. Njezina uloga je asinkrona obrada pojedinačnih okvira bez blokiranja korisničkog sučelja.

package com.example.anpr.analyzer

import android.graphics.Rect

import androidx.annotation.OptIn

import androidx.camera.core.ExperimentalGetImage

import androidx.camera.core.ImageAnalysis

import androidx.camera.core.ImageProxy

import com.google.mlkit.vision.common.InputImage

import com.google.mlkit.vision.text.TextRecognition

import com.google.mlkit.vision.text.latin.TextRecognizerOptions

class PlateAnalyzer(

    private val onTextDetected: (String) -\> Unit

) : ImageAnalysis.Analyzer {

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    @OptIn(ExperimentalGetImage::class)

    override fun analyze(imageProxy: ImageProxy) {

        val mediaImage = imageProxy.image

        if (mediaImage != null) {

            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            // Dimenzije trenutnog okvira iz kamere

            val imgWidth = imageProxy.width

            val imgHeight = imageProxy.height

            // Definiramo zamišljeni pravokutnik (ROI) na sredini fotografije iz kamere (npr. središnjih 35%)

            // Ovisno o rotaciji ekrana, nekad se širina i visina kamere moraju prilagoditi, ali za sredinu je isto

            val roiLeft = (imgWidth \* 0.30).toInt()

            val roiRight = (imgWidth \* 0.70).toInt()

            val roiTop = (imgHeight \* 0.35).toInt()

            val roiBottom = (imgHeight \* 0.65).toInt()

           

            val centerRegion = Rect(roiLeft, roiTop, roiRight, roiBottom)

            recognizer.process(image)

                .addOnSuccessListener { visionText -\>

                    for (block in visionText.textBlocks) {

                        // Dohvaćamo točne koordinate gdje se pročitani tekst nalazi na slici

                        val textBoundingBox = block.boundingBox

                        if (textBoundingBox != null) {

                            // Provjeravamo nalazi li se centar pročitanog teksta unutar našeg središnjeg okvira

                            val textCenterX = textBoundingBox.centerX()

                            val textCenterY = textBoundingBox.centerY()

                            if (centerRegion.contains(textCenterX, textCenterY)) {

                                // Tekst je uočen točno na sredini (unutar vizualnog okvira)!

                                onTextDetected(block.text)

                                return@addOnSuccessListener

                            }

                        }

                    }

                }

                .addOnCompleteListener {

                    imageProxy.close()

                }

        } else {

            imageProxy.close()

        }

    }

}

**4.2. Upravljanje životnim vijekom kamere: MainActivity.kt**

Vezanje kamere uz životni vijek komponente (LifecycleOwner) osigurava automatsko oslobađanje resursa kamere kada aplikacija ode u pozadinu.

package com.example.anpr

import android.os.Bundle

import android.widget.TextView

import androidx.appcompat.app.AppCompatActivity

import androidx.camera.core.CameraSelector

import androidx.camera.core.ImageAnalysis

import androidx.camera.core.Preview

import androidx.camera.lifecycle.ProcessCameraProvider

import androidx.camera.view.PreviewView

import androidx.core.content.ContextCompat

import com.example.anpr.analyzer.PlateAnalyzer

import java.util.concurrent.ExecutorService

import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var previewView: PreviewView

    private lateinit var textViewPlate: TextView

    private lateinit var cameraExecutor: ExecutorService

   

    // Spremamo referencu na cameraProvider kako bismo ga mogli odvezati (ugasiti) u bilo kojem trenutku

    private var cameraProvider: ProcessCameraProvider? = null

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)

        previewView = findViewById(R.id.previewView)

        textViewPlate = findViewById(R.id.textViewPlate)

        cameraExecutor = Executors.newSingleThreadExecutor()

        startANPRCamera()

    }

    private fun startANPRCamera() {

        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({

            // Dodjeljujemo vrijednost varijabli klase

            cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {

                it.setSurfaceProvider(previewView.surfaceProvider)

            }

            val imageAnalysis = ImageAnalysis.Builder()

                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)

                .build()

// Unutar startANPRCamera() metode promijenite samo dio gdje se postavlja Analyzer:

imageAnalysis.setAnalyzer(cameraExecutor, PlateAnalyzer { rawText -\>

    runOnUiThread {

        // 1. Istovremeno gasi kameru

        cameraProvider?.unbindAll()

       

        // 2. Upisuje pročitani tekst u TextView

        textViewPlate.text = rawText

       

        // 3. Zatvara view i Activity

        finish()

    }

})

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {

                cameraProvider?.unbindAll()

                cameraProvider?.bindToLifecycle(this, cameraSelector, preview, imageAnalysis)

            } catch (e: Exception) {

                e.printStackTrace()

            }

        }, ContextCompat.getMainExecutor(this))

    }

    private fun handleSuccessfulDetection(plateText: String, country: String) {

        // 1. Trenutačno gasi stream kamere i oslobađa hardver

        cameraProvider?.unbindAll()

       

        // 2. Ispisuje rezultat (ako se ekran zatvara presporo, da korisnik vidi)

        textViewPlate.text = "Prepoznato: \$plateText (\$country)"

       

        // 3. TODO: Ovdje možete spremiti rezultat u bazu, poslati ga natrag u prethodni Activity preko Intent-a ili LiveData

       

        // 4. Zatvara trenutni Activity i vraća korisnika na prethodni ekran

        finish()

    }

    override fun onDestroy() {

        super.onDestroy()

        cameraExecutor.shutdown()

    }

}

**Korisničko sučelje:**

*Prvo kreirajte datoteku res/drawable/okvir_ciljnika.xml za izgled ruba:*

\<?xml version="1.0" encoding="utf-8"?\>

\<shape xmlns:android="http://android.com"

    android:shape="rectangle"\>

    \<stroke

        android:width="3dp"

        android:color="#FF0000" /\> \<!-- Crveni rub --\>

    \<solid android:color="#00000000" /\> \<!-- Prozirna unutrašnjost --\>

    \<corners android:radius="8dp" /\>

\</shape\>

*Zatim u vaš activity_main.xml složite komponente:*

\<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://android.com"

    xmlns:app="http://android.com"

    android:layout_width="match_parent"

    android:layout_height="match_parent"\>

    \<!-- Prikaz kamere preko cijelog ekrana --\>

    \<androidx.camera.view.PreviewView

        android:id="@+id/previewView"

        android:layout_width="match_parent"

        android:layout_height="match_parent" /\>

    \<!-- VIZUALNI OKVIR: Korisnik ovdje mora pozicionirati tablicu --\>

    \<View

        android:id="@+id/visualFrame"

        android:layout_width="280dp"

        android:layout_height="80dp"

        android:background="@drawable/okvir_ciljnika"

        app:layout_constraintBottom_toBottomOf="parent"

        app:layout_constraintEnd_toEndOf="parent"

        app:layout_constraintStart_toStartOf="parent"

        app:layout_constraintTop_toTopOf="parent" /\>

    \<!-- TextView za ispis na dnu ekrana --\>

    \<TextView

        android:id="@+id/textViewPlate"

        android:layout_width="wrap_content"

        android:layout_height="wrap_content"

        android:layout_marginBottom="32dp"

        android:text="Stavite tablicu u okvir..."

        android:textColor="#FFFFFF"

        android:textSize="18sp"

        android:textStyle="bold"

        app:layout_constraintBottom_toBottomOf="parent"

        app:layout_constraintEnd_toEndOf="parent"

        app:layout_constraintStart_toStartOf="parent" /\>

\</androidx.constraintlayout.widget.ConstraintLayout\>

**5. Optimizacija i rješavanje problema**

**Strategija pritiska (Backpressure):** Korištenjem STRATEGY_KEEP_ONLY_LATEST, ako je procesor uređaja zauzet obradom trenutnog okvira, novi okviri koji dolaze iz kamere bit će odbačeni. To sprječava kašnjenje video prikaza ("lag") i osigurava analizu isključivo u stvarnom vremenu.

- **Optimizacija memorije:** Eksplicitno pozivanje metode imageProxy.close() u addOnCompleteListener bloku osigurava stabilnost aplikacije i sprječava curenje memorije (Memory Leaks).

- **Lažno pozitivni rezultati (False Positives):** Budući da ML Kit prepoznaje bilo koji tekst u okolini (reklame, prometne znakove), **Regex filter** u PlateAnalyzer klasi je prva i najvažnija linija obrane koja propušta samo tekst koji točno odgovara strukturi registarske pločice.

Asinkrona obrada transakcija

**1. Osnovni koncept**

Obrada parking transakcije ne izvršava se kompletno unutar HTTP zahtjeva kojim je transakcija zaprimljena.

WebAPI ima zadatak:

1.  zaprimiti zahtjev

2.  validirati osnovne podatke

3.  kreirati jedinstveni identifikator transakcije

4.  zapisati transakciju u bazu spark_work

5.  završiti HTTP zahtjev

Daljnju obradu izvršavaju background workeri koji se nalaze unutar istog ASP.NET Core WebAPI procesa.

ASP.NET CORE WEBAPI

│

┌──────────────────┼──────────────────┐

│ │ │

HTTP endpointi PaymentWorker FiscalizationWorker

│

WhatsAppNotificationWorker

Workeri se implementiraju kao zasebne BackgroundService klase i registriraju prilikom pokretanja WebAPI-ja.

Primjer:

builder.Services.AddHostedService\<PaymentWorker\>();

builder.Services.AddHostedService\<FiscalizationWorker\>();

builder.Services.AddHostedService\<WhatsAppNotificationWorker\>();

Na taj način nije potrebno instalirati zasebne Windows servise.

**2. spark_work kao durable queue**

Baza spark_work predstavlja trajni red čekanja za obradu transakcija.

To znači da stanje obrade nije pohranjeno samo u memoriji WebAPI-ja.

Svaka promjena stanja zapisuje se u SQL Server.

Zbog toga:

restart WebAPI-ja

↓

transakcije ostaju u spark_work

↓

Background Workeri se ponovno pokreću

↓

nastavljaju obradu

Restart aplikacije ili servera zbog toga ne uzrokuje gubitak transakcija.

**3. Zaprimanje nove transakcije**

Nova parking transakcija dolazi putem WebAPI-ja.

WebAPI je ne pokušava odmah naplatiti putem payment providera.

Umjesto toga radi:

Zahtjev za parking

↓

WebAPI

↓

VALIDACIJA

↓

INSERT spark_work

↓

payment_status = PENDING

↓

HTTP zahtjev završen

Primjer početnog stanja:

transaction_id = \<GUID\>

payment_status = PENDING

fiscal_status = PENDING

notification_status = PENDING

Time je transakcija sigurno pohranjena prije nego što započne komunikacija s vanjskim servisima.

**4. PaymentWorker**

PaymentWorker zadužen je isključivo za komunikaciju s payment providerom, primjerice Viva.com.

Worker periodički traži transakcije koje čekaju autorizaciju.

Logički uvjet:

payment_status = PENDING

Tok obrade:

spark_work

│

│ PENDING

▼

PaymentWorker

│

▼

Viva.com API

│

├── uspješno

│

▼

AUTHORIZED

Ako autorizacija uspije:

payment_status = AUTHORIZED

payment_authorized_at = ...

payment_transaction_id = ...

Transakcija je tada spremna za fiskalizaciju.

**5. Neuspješna payment autorizacija**

Potrebno je razlikovati **odbijenu transakciju** od **tehničke greške**.

Ako Viva vrati konačan odgovor da je kartica odbijena:

PENDING

↓

PaymentWorker

↓

Viva

↓

DECLINED

postavlja se:

payment_status = DECLINED

Takvu transakciju nije potrebno automatski ponovno pokušavati naplatiti.

Ako se dogodi privremena tehnička greška:

timeout

HTTP 5xx

privremena nedostupnost Vive

network error

transakcija prelazi u stanje za retry.

Primjer:

payment_status = RETRY

payment_retry_count = payment_retry_count + 1

payment_last_attempt = ...

payment_error = ...

Worker je može ponovno pokušati obraditi prema definiranoj retry politici.

**6. Zaštita od dvostruke naplate**

Payment obrada mora biti idempotentna.

Svaka parking transakcija ima jedinstveni:

transaction_id

Isti identifikator ili iz njega izvedena payment referenca koristi se pri komunikaciji s payment providerom.

Time retry iste transakcije ne smije rezultirati dvostrukom naplatom.

Posebno treba obraditi situaciju:

PaymentWorker

↓

Viva naplati karticu

↓

mrežni timeout

↓

PaymentWorker nije dobio odgovor

U takvoj situaciji worker ne smije automatski pretpostaviti da naplata nije izvršena.

Prije novog pokušaja mora se utvrditi status prethodne payment transakcije odnosno koristiti idempotency mehanizam payment providera.

**7. FiscalizationWorker**

FiscalizationWorker zadužen je isključivo za fiskalizaciju uspješno autoriziranih transakcija.

Traži transakcije koje zadovoljavaju:

payment_status = AUTHORIZED

AND

fiscal_status = PENDING

Tok:

AUTHORIZED

↓

FiscalizationWorker

↓

fiskalizacijski servis

↓

FISCALIZED

Nakon uspješne fiskalizacije spremaju se svi relevantni podaci:

fiscal_status = FISCALIZED

fiscalized_at

JIR / fiskalni identifikator

broj računa

ostali fiskalni podaci

**8. Nedostupnost fiskalizacije**

Payment i fiskalizacija namjerno su razdvojeni.

Ako je fiskalizacijski servis privremeno nedostupan:

payment_status = AUTHORIZED

fiscal_status = RETRY

PaymentWorker nastavlja normalno obrađivati ostale nove payment transakcije.

FiscalizationWorker zasebno pokušava ponovno fiskalizirati transakcije koje čekaju.

Primjer:

AUTHORIZED

↓

fiskalizacija

↓

TIMEOUT

↓

FISCAL_RETRY

↓

retry

↓

FISCALIZED

Nedostupnost fiskalizacije tako ne blokira payment queue.

**9. Prijenos u spark_central**

Nakon što su uspješno završeni:

payment_status = AUTHORIZED

fiscal_status = FISCALIZED

transakcija se smatra poslovno završenom.

Podaci se tada upisuju u:

spark_central

Nakon uspješnog upisa:

status = COMPLETED

completed_at = ...

spark_central mora imati UNIQUE ograničenje na transaction_id kako ponovno izvršavanje istog koraka ne bi kreiralo duplikat.

**10. WhatsAppNotificationWorker**

Slanje WhatsApp poruke također se obrađuje zasebno.

Razlog nije samo tehnička pouzdanost nego i činjenica da slanje WhatsApp poruka predstavlja trošak.

Zbog toga se tijekom normalne obrade **ne šalju nepotrebne statusne poruke** poput:

Obrada plaćanja je u tijeku.

Korisniku se šalje samo relevantna konačna poruka.

WhatsAppNotificationWorker traži:

status = COMPLETED

AND

notification_status = PENDING

Nakon toga šalje potvrdu, primjerice:

Parking za ZG 1234 AB uspješno je plaćen do 14:35.

Nakon uspješnog slanja:

notification_status = SENT

notification_sent_at = ...

**11. Greška kod slanja WhatsApp poruke**

Ako je transakcija:

COMPLETED

ali WhatsApp API trenutno nije dostupan, payment i fiskalizacija se **ne ponavljaju**.

Mijenja se samo:

notification_status = RETRY

WhatsAppNotificationWorker kasnije ponovno pokušava poslati poruku.

To je jedna od glavnih prednosti odvajanja pojedinih faza obrade.

**12. Neovisnost workera**

Tri workera rade neovisno:

PaymentWorker

│

▼

PAYMENT AUTHORIZED

│

▼

FiscalizationWorker

│

▼

FISCALIZED

│

▼

spark_central

│

▼

COMPLETED

│

▼

WhatsAppNotificationWorker

│

▼

SENT

Ako Viva.com trenutno nije dostupan, to ne zaustavlja fiskalizaciju prethodno autoriziranih transakcija.

Ako fiskalizacija nije dostupna, to ne zaustavlja PaymentWorker.

Ako WhatsApp nije dostupan, to ne utječe ni na payment ni na fiskalizaciju.

**13. Paralelno pokretanje workera**

Svi workeri nalaze se unutar istog WebAPI procesa:

ASP.NET Core WebAPI

│

├── HTTP API

│

├── PaymentWorker

│

├── FiscalizationWorker

│

└── WhatsAppNotificationWorker

Svaki worker ima vlastitu petlju obrade i vlastitu retry logiku.

Primjer koncepta:

public class PaymentWorker : BackgroundService

{

protected override async Task ExecuteAsync(

CancellationToken stoppingToken)

{

while (!stoppingToken.IsCancellationRequested)

{

await ObradiPaymentQueue(stoppingToken);

await Task.Delay(

TimeSpan.FromSeconds(1),

stoppingToken);

}

}

}

Isti princip koriste FiscalizationWorker i WhatsAppNotificationWorker.

**14. Claim transakcije**

WITH myCTE AS

(

SELECT TOP (1) \*

FROM dbo.Transakcije WITH

(

UPDLOCK,

READPAST,

ROWLOCK

)

WHERE payment_status = 'PENDING'

ORDER BY created_at, transaction_id

)

UPDATE myCTE

SET

payment_status = 'PROCESSING',

payment_last_attempt = SYSUTCDATETIME()

OUTPUT inserted.\*;

Transakciju zato treba **atomski preuzeti (claim)**.

Koncept:

PENDING

↓

PaymentWorker je preuzima

↓

PROCESSING

Samo worker koji je uspješno promijenio status:

PENDING → PROCESSING

smije poslati payment zahtjev.

Isti princip koristi se za fiskalizaciju i WhatsApp obavijesti.

Time je arhitektura spremna i za buduće horizontalno skaliranje WebAPI-ja.

**15. Predloženi podaci u spark_work**

Jedna transakcija može sadržavati najmanje sljedeća procesna polja:

transaction_id

created_at

completed_at

payment_status

payment_transaction_id

payment_retry_count

payment_last_attempt

payment_error

payment_authorized_at

fiscal_status

fiscal_retry_count

fiscal_last_attempt

fiscal_error

fiscalized_at

notification_status

notification_retry_count

notification_last_attempt

notification_error

notification_sent_at

status

Uz njih se nalaze poslovni podaci potrebni za obradu parkinga.

**16. Životni ciklus uspješne transakcije**

Kompletan normalni tok izgleda ovako:

KORISNIK / WHATSAPP

│

▼

WebAPI

│

▼

INSERT spark_work

│

│ payment=PENDING

▼

PaymentWorker

│

▼

Viva.com

│

│ AUTHORIZED

▼

FiscalizationWorker

│

▼

Fiskalizacija

│

│ FISCALIZED

▼

spark_central

│

│ COMPLETED

▼

WhatsAppNotificationWorker

│

▼

WhatsApp

│

▼

SENT

**17. Glavne prednosti arhitekture**

Ovakav način obrade omogućuje da niti jedan vanjski servis ne blokira HTTP WebAPI zahtjev.

SQL Server predstavlja trajni queue pa restart WebAPI-ja ne uzrokuje gubitak posla.

Payment, fiskalizacija i WhatsApp imaju potpuno odvojene statuse i retry mehanizme, čime se sprječava da greška u jednom sustavu ponovno pokrene već uspješno izvršene operacije.

Posebno je važno da:

**payment retry nikada ne uzrokuje dvostruku naplatu, fiskalizacijski retry nikada ponovno ne naplaćuje karticu, a WhatsApp retry nikada ponovno ne izvršava payment ili fiskalizaciju.**

Time spark_work predstavlja pouzdani procesni sloj između WebAPI-ja i vanjskih sustava, dok spark_central sadrži konačne, uspješno obrađene poslovne podatke.

Arhitektura baza podataka

Sustav koristi dvije aktivne Microsoft SQL Server baze podataka:

- spark_work

- spark_central

Za baze podataka koristi se **Microsoft SQL Server 22 Express**.

Baze imaju različite namjene. spark_work služi za siguran prihvat i obradu novopristiglih transakcija, dok spark_central predstavlja glavnu poslovnu bazu s trajno obrađenim podacima tekuće godine.

**1. spark_work**

spark_work je pomoćna radna baza koja služi kao **durable queue** za novopristigle transakcije.

WebAPI ne upisuje novu transakciju direktno u spark_central, nego je prvo pohranjuje u spark_work.

Osnovni tok je:

WhatsApp / WebAPI

↓

spark_work

↓

autorizacija plaćanja

↓

fiskalizacija

↓

spark_central

Na ovaj način transakcija je trajno spremljena prije početka obrade te se ne gubi u slučaju:

- prekida rada WebAPI-ja

- restarta servera

- nedostupnosti payment providera

- timeouta payment servisa

- privremene nedostupnosti fiskalizacije

- mrežnih problema

- drugih privremenih grešaka tijekom obrade

**Status transakcije**

Svaka transakcija u spark_work mora imati status obrade.

Primjer statusa:

NEW

PAYMENT_PENDING

PAYMENT_OK

FISCALIZATION_PENDING

COMPLETED

FAILED

Background servis obrađuje transakcije ovisno o njihovom trenutnom statusu.

Ako određeni korak nije moguće izvršiti, transakcija ostaje u spark_work i obrada se može naknadno ponoviti.

Primjer:

NEW

↓

PAYMENT_PENDING

↓

PAYMENT_OK

↓

FISCALIZATION_PENDING

↓

COMPLETED

Ako je fiskalizacijski servis privremeno nedostupan:

PAYMENT_OK

↓

FISCALIZATION_PENDING

↓

retry

↓

retry

↓

COMPLETED

Nakon uspješne autorizacije plaćanja i fiskalizacije, konačni poslovni podaci upisuju se u spark_central.

**Idempotencija**

Svaka transakcija mora imati jedinstveni identifikator, npr. transaction_id.

Isti identifikator koristi se kroz cijeli životni ciklus transakcije.

U spark_central mora postojati UNIQUE ograničenje nad tim identifikatorom kako ponovljeni webhook, retry ili ponovno pokretanje workera ne bi mogli kreirati duplikat iste transakcije.

Time obrada iste poruke više puta postaje sigurna.

**2. spark_central**

spark_central je glavna poslovna baza sustava.

Za razliku od spark_work, podaci u ovoj bazi predstavljaju **uspješno obrađene poslovne transakcije**.

U bazi se, između ostalog, mogu nalaziti:

- parking transakcije

- fiskalizirani računi

- podaci o payment transakcijama

- dnevne parkirne karte

- gradovi i parking-operateri

- parking zone

- cjenici

- kontrolori

- konfiguracija sustava

- konfiguracija payment providera

- ostali poslovni podaci

Aktivna baza se **uvijek zove spark_central**.

Aplikacija, WebAPI i background servisi zbog toga nikada ne moraju znati koja je poslovna godina.

WebAPI

↓

Worker

↓

spark_central

Naziv connection stringa i baze ostaje isti kroz sve godine.

**3. Godišnje arhiviranje baze spark_central**

Na kraju svake poslovne godine radi se arhiviranje baze spark_central.

Primjer za završetak 2026. godine:

spark_central

↓

BACKUP

↓

RESTORE

↓

spark_central_2026

Nakon uspješnog backup/restore postupka postoje dvije baze:

spark_central

spark_central_2026

spark_central_2026 predstavlja potpuni snapshot centralne baze na kraju 2026. godine.

Originalni backup također se trajno pohranjuje:

spark_central_2026.bak

Time postoje dvije razine arhive:

spark_central_2026

\+

spark_central_2026.bak

Prva omogućuje brzo pregledavanje povijesnih podataka, dok .bak predstavlja sigurnosnu kopiju baze.

**4. Provjera arhive**

Prije brisanja starih podataka iz aktivne baze mora se potvrditi da je arhivska baza uspješno kreirana.

Moguće je napraviti kontrolu broja transakcija i ukupnih financijskih vrijednosti.

Primjer:

SELECT

COUNT(\*) AS BrojTransakcija,

SUM(iznos) AS UkupniIznos

FROM dbo.Transakcije

WHERE datum \>= '20260101'

AND datum \< '20270101';

Rezultat se uspoređuje s podacima u:

spark_central_2026

Tek nakon uspješne provjere dozvoljeno je čišćenje aktivne baze.

**5. Čišćenje aktivne baze**

Nakon što je prethodna godina sigurno arhivirana, iz aktivne baze spark_central brišu se transakcijski podaci prethodnih godina.

DELETE FROM dbo.Transakcije

WHERE datum \< DATEFROMPARTS(YEAR(GETDATE()), 1, 1);

Oba izraza imaju istu poslovnu logiku:

Obriši sve transakcije čiji je datum prije početka tekuće godine.

Zbog toga sustav može normalno primati nove transakcije tijekom postupka čišćenja.

Transakcija koja stigne:

01.01.2027. 00:00:01

ima datum iz 2027. godine i neće biti obrisana.

**6. Podaci koji se ne brišu**

Godišnje čišćenje ne mora značiti potpuno pražnjenje baze spark_central.

Trajni konfiguracijski i matični podaci ostaju u aktivnoj bazi, primjerice:

GRADOVI

PARKING_ZONE

CJENICI

KONTROLORI

KORISNICI

POSTAVKE

PAYMENT_PROVIDER_CONFIG

WHATSAPP_CONFIG

Brišu se prvenstveno godišnji transakcijski podaci, primjerice:

PARKING_TRANSAKCIJE

FISKALIZIRANI_RACUNI

PAYMENT_TRANSAKCIJE

DNEVNE_KARTE

TRANSACTION_LOG

Točan redoslijed brisanja mora uzeti u obzir relacije i foreign key ograničenja između tablica.

**7. Arhivske baze**

Nakon više godina SQL Server može sadržavati:

spark_work

spark_central ← aktivna godina

spark_central_2026 ← arhiva

spark_central_2027 ← arhiva

spark_central_2028 ← arhiva

...

Aktivni sustav uvijek koristi:

spark_central

Arhivske baze koriste se samo kada je potrebno pristupiti povijesnim podacima.

Nakon kreiranja i provjere arhivske baze preporučuje se postaviti je u READ_ONLY način rada:

ALTER DATABASE spark_central_2026

SET READ_ONLY;

Time se sprječava slučajna izmjena ili brisanje povijesnih podataka.

**8. Čišćenje spark_work baze**

spark_work nije dugoročna arhiva.

Background servis periodički briše stare, uspješno obrađene transakcije.

Primjer:

COMPLETED

\+

starije od 30 dana

↓

DELETE

Transakcije koje nisu uspješno završene ne smiju se automatski brisati samo zato što su starije od 30 dana.

Primjerice:

FAILED

PAYMENT_PENDING

PAYMENT_OK

FISCALIZATION_PENDING

moraju ostati dostupne za analizu ili nastavak obrade dok se njihov status ne razriješi.

**9. Konačna arhitektura**

INTERNET

│

▼

WebAPI

│

▼

┌──────────────┐

│ spark_work │

│ │

│ durable queue│

└──────┬───────┘

│

Background Worker

│

┌──────────┴──────────┐

▼ ▼

Payment provider Fiskalizacija

(Viva/Nayax/...) │

│ │

└──────────┬──────────┘

│

▼

┌───────────────┐

│ spark_central │

│ │

│ aktivna godina│

└───────┬───────┘

│

kraj godine

│

backup/restore

│

▼

┌──────────────────┐

│spark_central_YYYY│

│ READ ONLY │

└──────────────────┘

**Sažetak**

Arhitektura se temelji na tri različite razine podataka:

**spark_work**  
Privremena, ali pouzdana radna baza za prihvat, retry i obradu novopristiglih transakcija.

**spark_central**  
Glavna aktivna poslovna baza koja uvijek ima isti naziv i prvenstveno sadrži transakcijske podatke tekuće godine.

**spark_central_YYYY**  
Godišnje arhivske baze nastale backup/restore postupkom. Nakon provjere služe kao read-only povijesni snapshot podataka.

Takav model omogućuje da aplikacijski sustav uvijek radi s istom bazom spark_central, dok se količina aktivnih transakcijskih podataka drži pod kontrolom godišnjim arhiviranjem.

**Arhitektura asinkrone obrade transakcija**

**1. Cilj arhitekture**

Sustav je projektiran tako da može prihvatiti velik broj istodobnih zahtjeva za kupnju parkiranja, bez čekanja da se izvrše vanjski procesi poput autorizacije plaćanja, fiskalizacije i slanja povratne poruke putem WhatsAppa.

Osnovni princip je:

**WebAPI brzo zaprima i persistentno sprema transakciju, a daljnju obradu preuzimaju neovisni background workeri putem Channel\<T\> queueova.**

Sustav koristi tri neovisna Channel\<Guid\> queuea:

- PaymentChannel – autorizacija plaćanja

- FiscalChannel – fiskalizacija i prijenos u spark_central

- WappChannel – slanje povratne WhatsApp poruke korisniku

TransactionId je identifikator koji se prenosi kroz sve faze obrade.

**2. Konceptualna arhitektura**

HTTP REQUEST

│

▼

┌───────────┐

│ WebAPI │

└─────┬─────┘

│

│ INSERT

▼

┌────────────────┐

│ TICKETS │

│ spark_work │

└───────┬────────┘

│

│ TransactionId

▼

┌──────────────────┐

│ PaymentChannel │

└────────┬─────────┘

│

▼

┌──────────────────┐

│ Viva Workers │

└────────┬─────────┘

│

Viva autorizacija

│

▼

VivaStatus = DONE

│

┌─────────────┴─────────────┐

│ │

│ TransactionId │ TransactionId

▼ ▼

┌──────────────────┐ ┌──────────────────┐

│ FiscalChannel │ │ WappChannel │

└────────┬─────────┘ └────────┬─────────┘

│ │

▼ ▼

┌──────────────────┐ ┌──────────────────┐

│ Fiscal Workers │ │ Wapp Workers │

└────────┬─────────┘ └────────┬─────────┘

│ │

Fiskalizacija WhatsApp API

│ │

▼ ▼

spark_central korisnik

**3. WebAPI – ulaz transakcije**

WebAPI endpoint zaprima zahtjev za kupnju parkiranja.

Endpoint **ne izvršava cijeli proces transakcije**.

Njegova odgovornost je:

1.  Validirati request.

2.  Generirati TransactionId.

3.  Upisati transakciju u spark_work.TICKETS.

4.  Postaviti VivaStatus = PENDING.

5.  Dodati TransactionId u PaymentChannel.

6.  Vratiti HTTP odgovor klijentu.

Konceptualno:

HTTP Request

│

▼

Validate

│

▼

INSERT TICKETS

│

├── VivaStatus = PENDING

│

├── FiscalStatus = PENDING

│

└── WappStatus = PENDING

│

▼

PaymentChannel.WriteAsync(TransactionId)

│

▼

HTTP Response

WebAPI ne čeka:

- Viva autorizaciju

- fiskalizaciju

- prijenos u spark_central

- slanje WhatsApp poruke

Time se vrijeme trajanja HTTP requesta svodi na minimum.

**4. PaymentChannel**

PaymentChannel je prvi queue u sustavu.

Njegova svrha je odvojiti **zaprimanje transakcija** od **autorizacije plaćanja**.

WebAPI je producer:

await PaymentChannel.Writer.WriteAsync(transactionId);

Viva worker je consumer:

await foreach (var transactionId

in PaymentChannel.Reader.ReadAllAsync(stoppingToken))

{

// obrada

}

Više Viva workera može istovremeno čitati isti PaymentChannel.

Primjer:

PaymentChannel

/ \| \\

▼ ▼ ▼

Worker1 Worker2 Worker3

│ │ │

T1 T2 T3

Jedan TransactionId preuzima samo jedan consumer.

Broj Viva workera konfigurira se neovisno o ostalim workerima.

Primjer:

PaymentChannel → 10 workera

**5. Viva Worker**

Viva Worker dohvaća TransactionId iz PaymentChannel.

Za svaki TransactionId:

**5.1. Preuzimanje transakcije**

Worker mijenja:

VivaStatus:

PENDING → PROCESSING

Promjena se mora napraviti uvjetno:

UPDATE TICKETS

SET VivaStatus = 'PROCESSING'

WHERE TransactionId = @TransactionId

AND VivaStatus = 'PENDING';

Ako je broj izmijenjenih redaka 0, transakcija se ne obrađuje ponovno.

**5.2. Autorizacija**

Worker izvršava autorizaciju prema Viva sustavu.

Ako autorizacija uspije:

VivaStatus = DONE

Ako autorizacija ne uspije:

VivaStatus = FAIL

**6. Nakon uspješne Viva autorizacije**

Nakon što je plaćanje uspješno autorizirano, Viva Worker postaje producer za **dva različita queuea**.

Viva Worker

│

VivaStatus=DONE

│

┌──────────┴──────────┐

│ │

▼ ▼

FiscalChannel WappChannel

Worker radi:

await fiscalChannel.Writer.WriteAsync(transactionId);

await wappChannel.Writer.WriteAsync(transactionId);

Time se pokreću dva potpuno neovisna procesa.

**7. FiscalChannel**

FiscalChannel služi za obradu fiskalizacije.

Producer je Viva Worker.

Consumeri su Fiscal Workeri.

Viva Worker

│

▼

FiscalChannel

│

┌───┼────┬────┐

▼ ▼ ▼ ▼

F1 F2 F3 F4

Fiscal Worker preuzima TransactionId i mijenja:

FiscalStatus:

PENDING → PROCESSING

Nakon toga:

1.  Dohvaća podatke transakcije.

2.  Izvršava fiskalizaciju.

3.  Sprema JIR.

4.  Sprema ZKI.

5.  Izračunava/sprema porezne podatke prema modelu sustava.

6.  Prenosi završenu transakciju u spark_central.

7.  Postavlja:

FiscalStatus = DONE

U slučaju greške:

FiscalStatus = FAIL

**8. WappChannel**

WappChannel je potpuno neovisan od fiskalizacije.

Njegova svrha je slanje povratne poruke korisniku koji je inicirao transakciju putem WhatsAppa.

Producer je Viva Worker.

Consumeri su Wapp Workeri.

Viva Worker

│

▼

WappChannel

│

┌───┼────┬────┐

▼ ▼ ▼ ▼

W1 W2 W3 W4

Wapp Worker preuzima TransactionId i mijenja:

WappStatus:

PENDING → PROCESSING

Zatim:

1.  Dohvaća potrebne podatke transakcije.

2.  Kreira WhatsApp poruku.

3.  Šalje poruku prema WhatsApp API-ju.

4.  Nakon uspješnog slanja postavlja:

WappStatus = DONE

U slučaju greške:

WappStatus = FAIL

**9. Fiskalizacija i WhatsApp su potpuno neovisni**

Važna karakteristika arhitekture je da WhatsApp odgovor **ne čeka fiskalizaciju**.

Nakon uspješne autorizacije:

Viva DONE

│

┌────────┴────────┐

▼ ▼

FiscalChannel WappChannel

│ │

▼ ▼

Fiskalizacija WhatsApp

Ako fiskalizacija traje 2 sekunde, a WhatsApp API odgovori za 300 ms:

Viva DONE

│

├──────────────→ WhatsApp → DONE

│

└────────────────────────→ Fiscal → DONE

WhatsApp korisnik ne mora čekati završetak fiskalizacije.

**10. Statusi transakcije**

Svaki pipeline ima vlastiti status.

**Viva**

PENDING

↓

PROCESSING

↓

DONE

ili:

PROCESSING

↓

FAIL

**Fiscal**

PENDING

↓

PROCESSING

↓

DONE

ili:

PROCESSING

↓

FAIL

**WhatsApp**

PENDING

↓

PROCESSING

↓

DONE

ili:

PROCESSING

↓

FAIL

Statusi su međusobno neovisni.

Primjer potpuno valjanog stanja:

VivaStatus = DONE

FiscalStatus = PROCESSING

WappStatus = DONE

To znači da je plaćanje autorizirano, WhatsApp odgovor poslan, a fiskalizacija još traje.

**11. Baza kao persistent source of truth**

Channel\<T\> je **in-memory queue** i nije persistentan.

Zbog toga baza ostaje izvor istine.

Channel služi za:

brzo prosljeđivanje posla workeru

Baza služi za:

trajno stanje transakcije i recovery nakon restarta aplikacije.

Primjer:

VivaStatus = DONE

FiscalStatus = PENDING

WappStatus = PENDING

Ako aplikacija prestane raditi prije nego što su TransactionId-ovi ubačeni u downstream queueove, transakcije se mogu pronaći prilikom sljedećeg pokretanja aplikacije i ponovno staviti u odgovarajući channel.

Recovery se izvodi **prilikom pokretanja aplikacije**, a ne periodičnim pollingom baze.

**12. Nema periodičnog DB pollinga**

Sustav ne koristi pristup:

while(true)

{

SELECT ...

WAIT

SELECT ...

}

Umjesto toga worker čeka na Channel.

await foreach (var transactionId

in channel.Reader.ReadAllAsync(stoppingToken))

{

await ProcessTransaction(transactionId, stoppingToken);

}

Kada nema transakcija, worker asinkrono čeka.

Kada WebAPI ili prethodni worker doda novu transakciju:

await channel.Writer.WriteAsync(transactionId);

čekajući consumer se aktivira.

Time nema nepotrebnog opterećenja SQL Servera.

**13. Više workera po channelu**

Svaki channel može imati različit broj consumera.

Primjer početne konfiguracije:

PaymentChannel

10 workera

FiscalChannel

4 workera

WappChannel

4 workera

Brojevi nisu međusobno povezani.

Ako Viva postane usko grlo:

PaymentChannel → 20

FiscalChannel → 4

WappChannel → 4

Ako WhatsApp postane usko grlo:

PaymentChannel → 10

FiscalChannel → 4

WappChannel → 10

Concurrency se tako može podešavati neovisno za svaki dio sustava.

**14. Bounded Channel**

Channel treba biti konfiguriran kao bounded channel kako bi se spriječilo nekontrolirano gomilanje transakcija u memoriji.

Primjer:

Channel.CreateBounded\<Guid\>(

new BoundedChannelOptions(10_000)

{

FullMode = BoundedChannelFullMode.Wait,

SingleWriter = false,

SingleReader = false

});

Ako queue dosegne kapacitet, producer neće beskonačno povećavati potrošnju memorije.

**15. DI i lifetime**

BackgroundService registriran pomoću:

builder.Services.AddHostedService\<VivaWorker\>();

registrira se kao Singleton.

Channeli također trebaju biti Singleton jer ih dijele WebAPI produceri i background consumeri.

Primjer:

builder.Services.AddSingleton\<Channel\<Guid\>\>(...);

builder.Services.AddHostedService\<VivaWorker\>();

builder.Services.AddHostedService\<FiscalWorker\>();

builder.Services.AddHostedService\<WappWorker\>();

Ako su TicketManager, database session ili drugi servisi Scoped, worker ih ne smije direktno primiti kroz konstruktor.

Umjesto toga koristi se IServiceScopeFactory:

using var scope = \_scopeFactory.CreateScope();

var ticketManager =

scope.ServiceProvider

.GetRequiredService\<TicketManager\>();

Time svaki worker može koristiti vlastiti scoped context/session.

**16. Ključne prednosti arhitekture**

**Skalabilnost**

HTTP request nije blokiran sporim vanjskim procesima.

**Kontrolirani concurrency**

Broj workera određuje koliko se istovremeno autorizira, fiskalizira ili šalje WhatsApp poruka.

**Izolacija**

Problemi u jednom pipelineu ne zaustavljaju ostale pipelineove.

**Backpressure**

Bounded channel sprečava nekontrolirano punjenje memorije.

**Recovery**

Baza čuva stanje pa restart aplikacije ne znači gubitak transakcija.

**Nema DB pollinga**

Normalni runtime ne radi periodične SELECT PENDING upite.

**Neovisno skaliranje**

Svaki pipeline može imati vlastiti broj workera.

**17. Konačni model**

Cijeli sustav može se promatrati kao tri neovisna producer-consumer pipelinea:

┌─────────────────────┐

│ WebAPI │

│ Producer │

└──────────┬──────────┘

│

▼

PaymentChannel

│

┌──────────▼──────────┐

│ Payment Workers │

│ Consumers │

└──────────┬──────────┘

│

PaymentStatus=DONE

│

┌──────────┴──────────┐

│ │

▼ ▼

FiscalChannel WappChannel

│ │

▼ ▼

Fiscal Workers Wapp Workers

│ │

▼ ▼

Fiscalization WhatsApp API

│ │

▼ ▼

spark_central DONE

**Ključni princip arhitekture je da se kroz sva tri pipelinea prenosi samo TransactionId, dok se stvarni podaci transakcije uvijek dohvaćaju iz baze.**

Time Channel ostaje lagan i brz, a SQL baza ostaje trajni izvor podataka i stanja procesa.

**Automatizacija zatvaranja stare i otvaranja nove godine**

Na prijelazu iz godine u godinu. Npr iz 2026 u 2027 nakon ponoći treba pokrenuti storu koja će napraviti backup stare baze, restoreati je u novu, validirati, postaviti na read only i na kraju izbrisati sve transakcije koje su nastale u prethodmin godinama:

CREATE PROCEDURE \[dbo\].\[zakljuci_godinu\]

@Godina int,

@BackupPath nvarchar(4000)

AS

BEGIN

SET NOCOUNT ON;

SET XACT_ABORT ON;

----------------------------------------------------------------

-- OSNOVNA VALIDACIJA PARAMETRA

----------------------------------------------------------------

IF @Godina \< 2020 OR @Godina \> YEAR(GETDATE())

BEGIN

THROW 50001, 'Neispravna godina za arhiviranje.', 1;

END;

----------------------------------------------------------------

-- VARIJABLE

----------------------------------------------------------------

DECLARE @SourceDb sysname = N'spark_central';

-- npr. spark_2026

DECLARE @ArchiveDb sysname =

N'spark\_' + CONVERT(varchar(4), @Godina);

-- Sve prije 01.01.2027. pripada zatvorenoj 2026. ili ranijoj godini

DECLARE @Granica datetime2(0) =

DATEFROMPARTS(@Godina + 1, 1, 1);

----------------------------------------------------------------

-- DEFAULT SQL SERVER PATHOVI

----------------------------------------------------------------

-- DECLARE @BackupPath nvarchar(4000) =

-- CONVERT(nvarchar(4000), SERVERPROPERTY('InstanceDefaultBackupPath'));

DECLARE @DataPath nvarchar(4000) =

CONVERT(nvarchar(4000), SERVERPROPERTY('InstanceDefaultDataPath'));

DECLARE @LogPath nvarchar(4000) =

CONVERT(nvarchar(4000), SERVERPROPERTY('InstanceDefaultLogPath'));

----------------------------------------------------------------

-- OSIGURAJ \\ NA KRAJU PATHA

----------------------------------------------------------------

IF RIGHT(@BackupPath, 1) \<\> N'\\

SET @BackupPath += N'\\;

IF RIGHT(@DataPath, 1) \<\> N'\\

SET @DataPath += N'\\;

IF RIGHT(@LogPath, 1) \<\> N'\\

SET @LogPath += N'\\;

----------------------------------------------------------------

-- NAZIV BACKUP DATOTEKE

-- npr:

-- C:\\..\Backup\spark_central_2026.bak

----------------------------------------------------------------

DECLARE @BackupFile nvarchar(4000) =

@BackupPath

\+ N'spark_central\_'

\+ CONVERT(varchar(4), @Godina)

\+ N'.bak';

----------------------------------------------------------------

-- FIZIČKI FILEOVI ARHIVSKE BAZE

----------------------------------------------------------------

DECLARE @ArchiveDataFile nvarchar(4000) =

@DataPath

\+ @ArchiveDb

\+ N'.mdf';

DECLARE @ArchiveLogFile nvarchar(4000) =

@LogPath

\+ @ArchiveDb

\+ N'\_log.ldf';

----------------------------------------------------------------

-- PROVJERA POSTOJI LI ARHIVSKA BAZA

--

-- NIKADA automatski ne pregaziti postojeću arhivu.

----------------------------------------------------------------

IF DB_ID(@ArchiveDb) IS NOT NULL

BEGIN

THROW 50002,

'Arhivska baza za navedenu godinu već postoji.',

1;

END;

----------------------------------------------------------------

-- DOHVATI LOGICAL FILE NAME IZ spark_central

--

-- Potrebni su za RESTORE ... WITH MOVE.

----------------------------------------------------------------

DECLARE @LogicalDataName sysname;

DECLARE @LogicalLogName sysname;

SELECT TOP (1)

@LogicalDataName = mf.name

FROM sys.master_files mf

WHERE mf.database_id = DB_ID(@SourceDb)

AND mf.type = 0

ORDER BY mf.file_id;

SELECT TOP (1)

@LogicalLogName = mf.name

FROM sys.master_files mf

WHERE mf.database_id = DB_ID(@SourceDb)

AND mf.type = 1

ORDER BY mf.file_id;

IF @LogicalDataName IS NULL OR @LogicalLogName IS NULL

BEGIN

THROW 50003,

'Nije moguće pronaći data/log file baze spark_central.',

1;

END;

----------------------------------------------------------------

-- BROJ TRANSAKCIJA KOJE ĆEMO ARHIVIRATI

----------------------------------------------------------------

DECLARE @BrojPrije bigint;

SELECT

@BrojPrije = COUNT_BIG(\*)

FROM dbo.TICKETS

WHERE CreatedAt \< @Granica;

PRINT '-------------------------------------------';

PRINT 'Zatvaranje godine: ' + CONVERT(varchar(4), @Godina);

PRINT 'Arhivska baza: ' + @ArchiveDb;

PRINT 'Backup file: ' + @BackupFile;

PRINT 'Broj transakcija za arhivu: '

\+ CONVERT(varchar(30), @BrojPrije);

PRINT '-------------------------------------------';

BEGIN TRY

----------------------------------------------------------------

-- 1. BACKUP

----------------------------------------------------------------

PRINT '1. BACKUP spark_central...';

DECLARE @Sql nvarchar(max);

SET @Sql =

N'BACKUP DATABASE ' + QUOTENAME(@SourceDb) +

N' TO DISK = N''' +

REPLACE(@BackupFile, '''', '''''') +

N'''

WITH

INIT,

CHECKSUM,

STATS = 10;';

EXEC sys.sp_executesql @Sql;

----------------------------------------------------------------

-- 2. VERIFY BACKUP

----------------------------------------------------------------

PRINT '2. RESTORE VERIFYONLY...';

SET @Sql =

N'RESTORE VERIFYONLY

FROM DISK = N''' +

REPLACE(@BackupFile, '''', '''''') +

N'''

WITH CHECKSUM;';

EXEC sys.sp_executesql @Sql;

----------------------------------------------------------------

-- 3. RESTORE U spark_YYYY

----------------------------------------------------------------

PRINT '3. RESTORE u ' + @ArchiveDb + '...';

SET @Sql =

N'RESTORE DATABASE ' + QUOTENAME(@ArchiveDb) +

N'

FROM DISK = N''' +

REPLACE(@BackupFile, '''', '''''') +

N'''

WITH

MOVE N''' +

REPLACE(@LogicalDataName, '''', '''''') +

N''' TO N''' +

REPLACE(@ArchiveDataFile, '''', '''''') +

N''',

MOVE N''' +

REPLACE(@LogicalLogName, '''', '''''') +

N''' TO N''' +

REPLACE(@ArchiveLogFile, '''', '''''') +

N''',

RECOVERY,

STATS = 10;';

EXEC sys.sp_executesql @Sql;

----------------------------------------------------------------

-- 4. DBCC CHECKDB ARHIVSKE BAZE

----------------------------------------------------------------

PRINT '4. DBCC CHECKDB...';

SET @Sql =

N'DBCC CHECKDB (' +

QUOTENAME(@ArchiveDb, '''') +

N') WITH NO_INFOMSGS;';

EXEC sys.sp_executesql @Sql;

----------------------------------------------------------------

-- 5. POSLOVNA VALIDACIJA

--

-- Broj transakcija \<= zatvorene godine u arhivskoj bazi

-- mora odgovarati broju prije arhiviranja.

----------------------------------------------------------------

PRINT '5. Validacija broja transakcija...';

DECLARE @BrojArhiva bigint;

SET @Sql =

N'SELECT @Cnt = COUNT_BIG(\*)

FROM ' + QUOTENAME(@ArchiveDb) +

N'.dbo.TICKETS

WHERE CreatedAt \< @Granica;';

EXEC sys.sp_executesql

@Sql,

N'@Granica datetime2(0), @Cnt bigint OUTPUT',

@Granica = @Granica,

@Cnt = @BrojArhiva OUTPUT;

IF @BrojPrije \<\> @BrojArhiva

BEGIN

THROW 50004,

'VALIDACIJA NIJE PROŠLA. Broj transakcija se ne poklapa.',

1;

END;

PRINT 'Validacija OK.';

PRINT 'Broj transakcija: '

\+ CONVERT(varchar(30), @BrojArhiva);

----------------------------------------------------------------

-- 6. POSTAVI ARHIVSKU BAZU READ_ONLY

----------------------------------------------------------------

PRINT '6. Postavljam ' + @ArchiveDb + ' u READ_ONLY...';

SET @Sql =

N'ALTER DATABASE ' +

QUOTENAME(@ArchiveDb) +

N' SET READ_ONLY WITH NO_WAIT;';

EXEC sys.sp_executesql @Sql;

----------------------------------------------------------------

-- 7. BRIŠI STARE TRANSAKCIJE IZ spark_central

--

-- Primjer:

-- @Godina = 2026

--

-- briše:

-- 2026

-- 2025

-- 2024

-- ...

--

-- NE briše ništa od 01.01.2027 nadalje.

----------------------------------------------------------------

PRINT '7. Brisanje arhiviranih transakcija iz spark_central...';

----------------------------------------------------------------

-- BRIŠEMO U BATCH-evima da ne napravimo ogroman transaction log.

----------------------------------------------------------------

DECLARE @Rows int = 1;

DECLARE @UkupnoObrisano bigint = 0;

WHILE @Rows \> 0

BEGIN

DELETE TOP (10000)

FROM dbo.TICKETS

WHERE CreatedAt \< @Granica;

SET @Rows = @@ROWCOUNT;

SET @UkupnoObrisano += @Rows;

END;

----------------------------------------------------------------

-- 8. ZAVRŠNA PROVJERA

----------------------------------------------------------------

IF EXISTS

(

SELECT 1

FROM dbo.TICKETS

WHERE CreatedAt \< @Granica

)

BEGIN

THROW 50005,

'Nisu obrisane sve arhivirane transakcije.',

1;

END;

----------------------------------------------------------------

-- GOTOVO

----------------------------------------------------------------

PRINT '-------------------------------------------';

PRINT 'GODINA USPJEŠNO ZATVORENA.';

PRINT 'Godina: ' + CONVERT(varchar(4), @Godina);

PRINT 'Arhiva: ' + @ArchiveDb;

PRINT 'Backup: ' + @BackupFile;

PRINT 'Obrisano transakcija: '

\+ CONVERT(varchar(30), @UkupnoObrisano);

PRINT '-------------------------------------------';

----------------------------------------------------------------

-- RETURN RESULT

----------------------------------------------------------------

SELECT

@Godina AS godina,

@ArchiveDb AS arhivska_baza,

@BackupFile AS backup_file,

@BrojArhiva AS arhivirano_transakcija,

@UkupnoObrisano AS obrisano_transakcija,

CAST(1 AS bit) AS uspjesno;

END TRY

BEGIN CATCH

DECLARE @ErrorMessage nvarchar(4000) = ERROR_MESSAGE();

PRINT '===========================================';

PRINT 'GREŠKA KOD ZATVARANJA GODINE';

PRINT @ErrorMessage;

PRINT '===========================================';

THROW;

END CATCH;

END;

INTEGRACIJE (TREĆE STRANE)

- **WhatsApp Business API:** Slanje transakcijskih i uslužnih poruka.

- **Viva.com API:** Procesuiranje kartičnih plaćanja, povrat sredstava i tokenizacija.

- **CIS (Centralni informacijski sustav Porezne uprave):** Servis za fiskalizaciju računa u RH.

OSTALI ZAHTJEVI

- **Sigurnost podataka (PCI-DSS):** Sustav ne smije spremati CVC brojeve ni pune brojeve kreditnih kartica u vlastitu bazu. Svi kartični podaci moraju biti procesuirani i tokenizirani isključivo na strani Viva.com gatewaya.

- **Brzina odziva (Performanse):** Provjera registarske oznake s Android uređaja kontrolora mora vratiti odgovor u roku od maksimalno 1.5 sekundi kako se ne bi usporavao rad na terenu.

- **Dostupnost sustava:** Arhitektura mora podržavati minimalno 99.9% dostupnosti (High Availability), s obzirom na to da sustav naplate radi 24/7.

- Sva komunikacija mora ići preko HTTPS kanala te API-KEY provjere gdje je moguće.

Struktura baze podataka

Postojat će dvije baze podataka:

- spark_work

- spark_central

**spark_work**

Radna baza koja služi samo za brzo zaprimanje zahtjeva za parkirnom kartom. Sadrži samo dvije tablice:

- TICKETS

- TICKET_TYPES

- PAKRING_OBSERVATIONS

**spark_central**

Baza koju koriste klijent aplikacije za potrebe ažuriranja podataka i izvještavanja. Baza se puni sa transakcijama kroz servise koji obrađuju spark_work TICKETS. Sadrži slijedeće tablice:

- CITY_TENANTS

  - Popis gradova korisnika sustava.

- ZONES

  - Popis zona naplata unutar pojedinih gradova s cijenama i trajanjima parkinga.

- TICKET_TYPES

  - Vrste parkirnih karata ('Standard' i 'Dnevna')

- TICKETS

  - Izdane parkirne karte (dnevne i standard)

- PRIVILEGED_OWNERS

  - Popis reg. Oznaka koje ne plaćaju parkiranje (Stanari i slično)

- PARKING_OBSERVATIONS. Tablica u koju se zapisuje datum i vrijeme te reg. oznaka vozila kad ju kontrolor prvi puta očita a ista nije plaćena. Služi kako bi mogli omogućiti button za Izdavanje dnevne parkirne karte ako od prvog opažanja prođe više od 15 minuta.

- VEHICLE_BRANDS. Read Only , popis marki vozila za odabir.

Dijagram baze podataka:

**Tablica TICKETS**

Ova tablica se teba nalaziti u obje baze: spark_work i spark_central identične strukture. Nakon zaprimanja requesta preko WebAPI ja (WhatsApp kupnja karte) ticket se zapisuje u spark_work što je trenutno. Nakon što prođu svi procesi (autorizacija kartice i fiskalizacija) prebacuje se u spark_central i vraća poruka na WhatsApp.

CREATE TABLE dbo.TICKETS

(

TicketId UNIQUEIDENTIFIER NOT NULL,

TransactionId BIGINT IDENTITY(1,1) NOT NULL,

TenantId INT NOT NULL,

InspectorId INT NULL,

TicketTypeId INT NOT NULL

CONSTRAINT DF_TICKETS_TicketTypeId

DEFAULT (1),

VehicleRegistration VARCHAR (20) NOT NULL,

VehicleCountryCode VARCHAR (2) NULL,

Address VARCHAR (100) NULL,

ZoneId INT NOT NULL,

ParkingMinutes INT NOT NULL,

Amount DECIMAL(18,6) NOT NULL,

Osnovica DECIMAL(18,6) NOT NULL,

StopaPDV DECIMAL(18,2) NOT NULL,

IznosPDV DECIMAL(18,6) NOT NULL,

InvoiceNo INT NOT NULL,

PremisesCode VARCHAR(25) NOT NULL,

CashRegisterCode VARCHAR(15) NOT NULL,

CreatedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_TICKETS_CreatedAt

DEFAULT (SYSUTCDATETIME()),

ValidUntil AS DATEADD(MINUTE, ParkingMinutes, CreatedAt),

PhoneNumber VARCHAR(30) NULL,

WhatsAppMessageId VARCHAR(100) NOT NULL,

-- Viva.com

PaymentStatus VARCHAR(10) NOT NULL

CONSTRAINT DF_TICKETS_VivaStatus

DEFAULT ('PENDING'),

PaymentRetryCount INT NOT NULL

CONSTRAINT DF_TICKETS_VivaRetryCount

DEFAULT (0),

PaymentProcessingAt DATETIME2(3) NULL,

PaymentTransactionId VARCHAR(100) NULL,

PaymentLastError NVARCHAR(2000) NULL,

PaymentAuthorizedAt DATETIME2(3) NULL,

-- Fiskalizacija

FiscalStatus VARCHAR(10) NOT NULL

CONSTRAINT DF_TICKETS_FiscalStatus

DEFAULT ('PENDING'),

FiscalRetryCount INT NOT NULL

CONSTRAINT DF_TICKETS_FiscalRetryCount

DEFAULT (0),

FiscalProcessingAt DATETIME2(3) NULL,

JIR VARCHAR(50) NULL,

ZKI VARCHAR(50) NULL,

FiscalLastError NVARCHAR(2000) NULL,

FiscalizedAt DATETIME2(3) NULL,

-- SPARK_CENTRAL

CentralStatus VARCHAR(10) NOT NULL

CONSTRAINT DF_TICKETS_CentralStatus

DEFAULT ('PENDING'),

CentralRetryCount INT NOT NULL

CONSTRAINT DF_TICKETS_CentralRetryCount

DEFAULT (0),

CentralProcessingAt DATETIME2(3) NULL,

CentralLastError NVARCHAR(2000) NULL,

TransferredAt DATETIME2(3) NULL,

-- Audit

UpdatedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_TICKETS_UpdatedAt

DEFAULT (SYSUTCDATETIME()),

CONSTRAINT PK_TICKETS

PRIMARY KEY CLUSTERED (TicketId),

CONSTRAINT FK_TICKETS_CITY_TENANTS

FOREIGN KEY (TenantId)

REFERENCES dbo.CITY_TENANTS (TenantId),

CONSTRAINT FK_TICKETS_CITY_TENANTS_CODES

FOREIGN KEY (TenantId, PremisesCode, CashRegisterCode)

REFERENCES dbo.CITY_TENANTS

(TenantId, PremisesCode, CashRegisterCode),

CONSTRAINT FK_TICKETS_TICKET_TYPES

FOREIGN KEY (TicketTypeId)

REFERENCES dbo.TICKET_TYPES (TicketTypeId),

CONSTRAINT FK_TICKETS_ZONES

FOREIGN KEY (ZoneId)

REFERENCES dbo.ZONES (ZoneId),

CONSTRAINT UQ_TICKETS_TransactionId

UNIQUE (TransactionId),

CONSTRAINT UQ_TICKETS_WhatsAppMessageId

UNIQUE (WhatsAppMessageId),

CONSTRAINT CK_TICKETS_VivaStatus

CHECK (VivaStatus IN

('PENDING', 'PROCESSING', 'DONE', 'FAIL')),

CONSTRAINT CK_TICKETS_FiscalStatus

CHECK (FiscalStatus IN

('PENDING', 'PROCESSING', 'DONE', 'FAIL')),

CONSTRAINT CK_TICKETS_CentralStatus

CHECK (CentralStatus IN

('PENDING', 'PROCESSING', 'DONE', 'FAIL'))

);

**Tablica PARKING_OBSERVATIONS**

Tablica se nalazi u obje baze. U nju WebAPI automatski dodaje zapis kada kontrolor prvi puta provjerava registarsku oznaku vozila a isto nije prijavilo parkiranje ili plaćanje nije uspjelo. Koristi nam za ispis na DKP i da bismo mogli provjeriti koliko je vremena prošlo od prvog zapažanja vozila pa do idućeg jer se DPK izdaje samo ako je od prvog zapažanja prošlo više od 15 minuta (definirano kroz postavke zone)

CREATE TABLE dbo.PARKING_OBSERVATIONS

(

ObservationId BIGINT IDENTITY(1,1) NOT NULL,

TenantId INT NOT NULL,

VehicleRegistration VARCHAR(20) NOT NULL,

InspectorId INT NOT NULL,

ObservedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_PARKING_OBSERVATIONS_ObservedAt

DEFAULT SYSUTCDATETIME(),

CONSTRAINT PK_PARKING_OBSERVATIONS

PRIMARY KEY (ObservationId),

CONSTRAINT FK_PARKING_OBSERVATIONS_TENANT

FOREIGN KEY (TenantId)

REFERENCES dbo.CITY_TENANTS(TenantId),

CONSTRAINT FK_PARKING_OBSERVATIONS_INSPECTOR

FOREIGN KEY (InspectorId)

REFERENCES dbo.INSPECTORS(InspectorId)

);

**Tablica ZONES**

U ovoj tablici nalazi se popis zona parkiranja s trajanjem i cijenom parkiranja. Ova tablica nalazi se samo u spark_central.

CREATE TABLE dbo.ZONES

(

ZoneId INT IDENTITY(1,1) NOT NULL,

TenantId INT NOT NULL,

ZoneCode VARCHAR(20) NOT NULL,

ZoneName VARCHAR(20) NOT NULL,

Price DECIMAL(10,2) NOT NULL,

DailyTicketPrice DECIMAL(10,2) NOT NULL,

DurationMinutes INT NOT NULL,

MaxExtensions INT NOT NULL DEFAULT (3),

DpkIssueDelayMinutes INT NOT NULL DEFAULT(15),

CONSTRAINT PK_ZONES

PRIMARY KEY CLUSTERED (ZoneId),

CONSTRAINT FK_ZONES_CITY_TENANTS

FOREIGN KEY (TenantId)

REFERENCES dbo.CITY_TENANTS (TenantId),

CONSTRAINT UQ_ZONES_Tenant_ZoneCode

UNIQUE (TenantId, ZoneCode),

CONSTRAINT UQ_ZONES_Tenant_ZoneName

UNIQUE (TenantId, ZoneName),

CONSTRAINT CK_ZONES_Price

CHECK (Price \>= 0),

CONSTRAINT CK_ZONES_DurationMinutes

CHECK (DurationMinutes \> 0)

);

**Tablica CITY_TENANTS**

Tablica CITY_TENANTS nalazi se samo u bazi spark_central i u njoj se nalazi popis gradova / poslovnih subjekata koji preko ovog sustava naplaćuju parkiranje. Služit će nam za fakturiranje naše usluge pojedinim gradovima.

CREATE TABLE \[dbo\].\[CITY_TENANTS\](

\[TenantId\] \[int\] IDENTITY(1,1) NOT NULL,

\[TenantCode\] \[varchar\](50) NOT NULL,

\[TenantName\] \[varchar\](100) NOT NULL,

\[VatID\] \[varchar\](20) NOT NULL,

\[ZipCode\] \[varchar\](10) NOT NULL,

\[City\] \[varchar\](100) NOT NULL,

\[CountryCode\] \[char\](2) NOT NULL,

\[Address\] \[varchar\](150) NOT NULL,

\[HouseNo\] \[varchar\](20) NOT NULL,

\[PremisesCode\] \[varchar\](25) NOT NULL,

\[CashRegisterCode\] \[varchar\](15) NOT NULL,

\[StopaPDV\] \[decimal\](18, 2) NOT NULL,

\[IsActive\] \[bit\] NOT NULL,

\[CreatedAt\] \[datetime2\](3) NOT NULL,

\[UpdatedAt\] \[datetime2\](3) NOT NULL,

CONSTRAINT \[PK_CITY_TENANTS\] PRIMARY KEY CLUSTERED

(

\[TenantId\] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON \[PRIMARY\],

CONSTRAINT \[UQ_CITY_TENANTS_Tenant_Premises_CashRegister\] UNIQUE NONCLUSTERED

(

\[TenantId\] ASC,

\[PremisesCode\] ASC,

\[CashRegisterCode\] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON \[PRIMARY\],

CONSTRAINT \[UQ_CITY_TENANTS_TenantCode\] UNIQUE NONCLUSTERED

(

\[TenantCode\] ASC

)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON \[PRIMARY\]

) ON \[PRIMARY\]

GO

ALTER TABLE \[dbo\].\[CITY_TENANTS\] ADD CONSTRAINT \[DF_CITY_TENANTS_StopaPDV\] DEFAULT ((25)) FOR \[StopaPDV\]

GO

ALTER TABLE \[dbo\].\[CITY_TENANTS\] ADD CONSTRAINT \[DF_CITY_TENANTS_IsActive\] DEFAULT ((1)) FOR \[IsActive\]

GO

ALTER TABLE \[dbo\].\[CITY_TENANTS\] ADD CONSTRAINT \[DF_CITY_TENANTS_CreatedAt\] DEFAULT (sysutcdatetime()) FOR \[CreatedAt\]

GO

ALTER TABLE \[dbo\].\[CITY_TENANTS\] ADD CONSTRAINT \[DF_CITY_TENANTS_UpdatedAt\] DEFAULT (sysutcdatetime()) FOR \[UpdatedAt\]

GO

ALTER TABLE \[dbo\].\[CITY_TENANTS\] WITH CHECK ADD CONSTRAINT \[CK_CITY_TENANTS_CashRegisterCode\] CHECK ((NOT \[CashRegisterCode\] like '%\[^0-9\]%' AND NOT \[CashRegisterCode\] like '0%'))

GO

ALTER TABLE \[dbo\].\[CITY_TENANTS\] CHECK CONSTRAINT \[CK_CITY_TENANTS_CashRegisterCode\]

GO

**Tablica INSPECTORS**

Tablica INSPECTORS nalazi se samo i spark_central bazi. U njoj se čuva popis kontrolora koji koriste Android aplikaciju za provjeru karata. Tablica sadrži PIN sa kojim se prijavljuju te ostale podatke kao što su ime, prezime, OIB te da li je korisnik aktivan ili nije. Samo aktivni korisnici se mogu prijaviti putem PIN-a u aplikaciju.

CREATE TABLE dbo.INSPECTORS

(

InspectorId INT IDENTITY(1,1) NOT NULL,

TenantId INT NOT NULL,

Oib CHAR(11) NOT NULL,

Name NVARCHAR(100) NOT NULL,

Surname NVARCHAR(100) NOT NULL,

Pin VARCHAR(4) NOT NULL,

IsActive BIT NOT NULL

CONSTRAINT DF_INSPECTORS_IsActive DEFAULT (1),

CONSTRAINT PK_INSPECTORS

PRIMARY KEY (InspectorId),

CONSTRAINT FK_INSPECTORS_TENANTS

FOREIGN KEY (TenantId)

REFERENCES dbo.TENANTS (TenantId),

CONSTRAINT UQ_INSPECTORS_Tenant_Oib

UNIQUE (TenantId, Oib),

CONSTRAINT CK_INSPECTORS_Pin

CHECK (Pin NOT LIKE '%\[^0-9\]%')

);

**Tablica PAYMENT_TOKENS**

Tablica se nalazi samo u spark_central bazi. U ovoj tablici se čuvaju tokeni kreditnih kartica kupaca odnosno telefonskih brojeva koji dolaze s WhatsAppa. Služi kako bismo mogli naplatiti parkiranje bez da korisnik upisuje podatke o kartici. Podaci o kartici se upisuju samo prvi puta kod plaćanja prvog parkiranja. Viva za recurring payment koristi **transactionId početne uspješne transakcije**. Kod sljedeće naplate šalješ taj initial transaction ID i iznos; Viva tada tereti istu payment metodu bez interakcije korisnika.

CREATE TABLE dbo.PAYMENT_TOKENS

(

PaymentTokenId UNIQUEIDENTIFIER NOT NULL,

PhoneNumber VARCHAR(30) NOT NULL,

VivaInitialTransactionId UNIQUEIDENTIFIER NOT NULL,

CardUniqueReference VARCHAR(100) NULL,

CreatedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_PAYMENT_TOKENS_CreatedAt

DEFAULT (SYSUTCDATETIME()),

UpdatedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_PAYMENT_TOKENS_UpdatedAt

DEFAULT (SYSUTCDATETIME()),

IsActive BIT NOT NULL

CONSTRAINT DF_PAYMENT_TOKENS_IsActive

DEFAULT (1),

CONSTRAINT PK_PAYMENT_TOKENS

PRIMARY KEY CLUSTERED (PaymentTokenId),

CONSTRAINT UQ_PAYMENT_TOKENS_InitialTransaction

UNIQUE (VivaInitialTransactionId)

);

**Tablica PRIVILEGED_OWNERS**

Tablica se nalazi samo u spart_central bazi. Čuva popis reg oznaka vozila te adresa i naziva vlasnika povlaštenih karata. Služi kod provjere plaćanja parkiranja da ako karta nije kupljena preko WhatsAppa a reg. Oznaka se nalazi u ovoj tablici i ValidUntil je veći ili jednak trenutnom datumu da se to tretira kao da je karta plaćena pa na kontrolor na kontrolnoj aplikaciji dobije informaciju da je karta plaćena iako zapravo nije. To služi kako bi se stanari koji parkiraju na tim mjestima oslobodili plaćanja parkiranja. Iz spark_work u spark_central se podatak prebacuje po uspješnoj autorizaciji kartice i fiskalizaciji

CREATE TABLE dbo.PRIVILEGED_OWNERS

(

PrivilegedOwnerId BIGINT IDENTITY(1,1) NOT NULL,

TenantId INT NOT NULL,

VehicleRegistration VARCHAR(20) NOT NULL,

ValidUntil DATETIME2(3) NOT NULL,

OwnerName VARCHAR(200) NOT NULL,

Address VARCHAR(150) NOT NULL,

HouseNo VARCHAR(20) NOT NULL,

ZipCode VARCHAR(10) NOT NULL,

City VARCHAR(100) NOT NULL,

CreatedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_PRIVILEGED_TICKETS_CreatedAt

DEFAULT (SYSUTCDATETIME()),

UpdatedAt DATETIME2(3) NOT NULL

CONSTRAINT DF_PRIVILEGED_TICKETS_UpdatedAt

DEFAULT (SYSUTCDATETIME()),

CONSTRAINT PK_PRIVILEGED_TICKETS

PRIMARY KEY CLUSTERED (PrivilegedOwnerId),

CONSTRAINT FK_PRIVILEGED_TICKETS_CITY_TENANTS

FOREIGN KEY (TenantId)

REFERENCES dbo.CITY_TENANTS (TenantId)

);

**Tablica VEHICLE_BRANDS**

Tablica se nalazi u obje baze i sadrži fiksni popis brandova vozila („Citroen“,“Vw“,“Toyota“ i sl.) te služi kako bi kontrolor mogao prilikom izdavanja DPK odabrati marku vozila.

CREATE TABLE dbo.VEHICLE_BRANDS

(

VehicleBrandId INT IDENTITY(1,1) NOT NULL,

Name NVARCHAR(100) NOT NULL,

IsActive BIT NOT NULL

CONSTRAINT DF_VEHICLE_BRANDS_IsActive

DEFAULT (1),

CONSTRAINT PK_VEHICLE_BRANDS

PRIMARY KEY (VehicleBrandId),

CONSTRAINT UQ_VEHICLE_BRANDS_Name

UNIQUE (Name)

);

INSERT INTO dbo.VEHICLE_BRANDS (Name)

VALUES

-- EUROPA

(N'Abarth'),

(N'Alfa Romeo'),

(N'Alpine'),

(N'Aston Martin'),

(N'Audi'),

(N'Bentley'),

(N'BMW'),

(N'Bugatti'),

(N'Citroën'),

(N'Cupra'),

(N'Dacia'),

(N'DAF'),

(N'DS Automobiles'),

(N'Ferrari'),

(N'Fiat'),

(N'Iveco'),

(N'Jaguar'),

(N'Koenigsegg'),

(N'Lamborghini'),

(N'Lancia'),

(N'Land Rover'),

(N'Lotus'),

(N'MAN'),

(N'Maserati'),

(N'McLaren'),

(N'Mercedes-Benz'),

(N'MINI'),

(N'Morgan'),

(N'Opel'),

(N'Pagani'),

(N'Peugeot'),

(N'Polestar'),

(N'Porsche'),

(N'Renault'),

(N'Rimac'),

(N'Rolls-Royce'),

(N'Saab'),

(N'Scania'),

(N'SEAT'),

(N'Skoda'),

(N'Smart'),

(N'Volkswagen'),

(N'Volvo'),

-- JAPAN

(N'Acura'),

(N'Daihatsu'),

(N'Honda'),

(N'Infiniti'),

(N'Isuzu'),

(N'Lexus'),

(N'Mazda'),

(N'Mitsubishi'),

(N'Nissan'),

(N'Subaru'),

(N'Suzuki'),

(N'Toyota'),

-- JUŽNA KOREJA

(N'Daewoo'),

(N'Genesis'),

(N'Hyundai'),

(N'Kia'),

(N'KGM'),

(N'SsangYong'),

-- SAD

(N'Buick'),

(N'Cadillac'),

(N'Chevrolet'),

(N'Chrysler'),

(N'Dodge'),

(N'Ford'),

(N'GMC'),

(N'Hummer'),

(N'Jeep'),

(N'Lincoln'),

(N'Lucid'),

(N'Pontiac'),

(N'Rivian'),

(N'Tesla'),

-- KINA

(N'Aiways'),

(N'BAIC'),

(N'BYD'),

(N'Changan'),

(N'Chery'),

(N'Dongfeng'),

(N'Exeed'),

(N'Foton'),

(N'Geely'),

(N'Great Wall'),

(N'Haval'),

(N'Hongqi'),

(N'JAC'),

(N'Jaecoo'),

(N'Leapmotor'),

(N'Li Auto'),

(N'Lynk & Co'),

(N'Maxus'),

(N'MG'),

(N'Nio'),

(N'Omoda'),

(N'Ora'),

(N'SerES'),

(N'Voyah'),

(N'Wey'),

(N'XPeng'),

(N'Zeekr'),

-- INDIJA

(N'Mahindra'),

(N'Maruti Suzuki'),

(N'Tata'),

-- MALEZIJA

(N'Perodua'),

(N'Proton'),

-- VIJETNAM

(N'VinFast'),

-- RUSIJA

(N'GAZ'),

(N'Lada'),

(N'Moskvich'),

(N'UAZ'),

-- TURSKA

(N'Togg'),

-- OSTALO / NEPOZNATO

(N'Ostalo / nepoznato');

**Tablica TICKET_TYPES**

Ova tablica nalazi se u obje baze spark_work i spark_central. Služi kako bi mogli razlikovati dnevne parkirne karte (kazne) i obične karte za prakiranje. Postoje samo dva moguća tipa: 'Standard' i 'Dnevna' gdje je 'Standard default a 'Dnevna' se koristi samo za naplatu kazni.

CREATE TABLE dbo.TICKET_TYPES

(

TicketTypeId INT IDENTITY(1,1) NOT NULL,

Name VARCHAR(50) NOT NULL,

CONSTRAINT PK_TICKET_TYPES

PRIMARY KEY CLUSTERED (TicketTypeId),

CONSTRAINT UQ_TICKET_TYPES_Name

UNIQUE (Name)

);

INSERT INTO dbo.TICKET_TYPES (Name)

VALUES

('Standard'),

('Dnevna');

Android UI

Button OK

\<?xml version="1.0" encoding="utf-8"?\>

\<selector xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<item android:state_pressed="true"\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#0A5C2A"

                android:endColor="#18C65A" /\>

            \<stroke

                android:width="2dp"

                android:color="#66FF99" /\>

            \<padding

                android:left="18dp"

                android:top="12dp"

                android:right="18dp"

                android:bottom="12dp" /\>

        \</shape\>

    \</item\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#062C18"

                android:endColor="#0B7A36" /\>

            \<stroke

                android:width="2dp"

                android:color="#42F57B" /\>

            \<padding

                android:left="18dp"

                android:top="12dp"

                android:right="18dp"

                android:bottom="12dp" /\>

        \</shape\>

    \</item\>

\</selector\>

Button Cancel

\<?xml version="1.0" encoding="utf-8"?\>

\<selector xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<item android:state_pressed="true"\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#65121A"

                android:endColor="#E62B3A" /\>

            \<stroke

                android:width="2dp"

                android:color="#FF6B75" /\>

            \<padding

                android:left="18dp"

                android:top="12dp"

                android:right="18dp"

                android:bottom="12dp" /\>

        \</shape\>

    \</item\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#2A0B0F"

                android:endColor="#8C1822" /\>

            \<stroke

                android:width="2dp"

                android:color="#FF3B4D" /\>

            \<padding

                android:left="18dp"

                android:top="12dp"

                android:right="18dp"

                android:bottom="12dp" /\>

        \</shape\>

    \</item\>

\</selector\>

Button Clear (Login)

\<?xml version="1.0" encoding="utf-8"?\>

\<selector xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<item android:state_pressed="true"\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#6B101A"

                android:endColor="#FF3045" /\>

            \<stroke

                android:width="2dp"

                android:color="#FF7A85" /\>

        \</shape\>

    \</item\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#24090D"

                android:endColor="#7D111B" /\>

            \<stroke

                android:width="2dp"

                android:color="#FF4053" /\>

        \</shape\>

    \</item\>

\</selector\>

Button back (Login)

\<?xml version="1.0" encoding="utf-8"?\>

\<selector xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<item android:state_pressed="true"\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#6B3B00"

                android:endColor="#FF9800" /\>

            \<stroke

                android:width="2dp"

                android:color="#FFC45C" /\>

        \</shape\>

    \</item\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#2B1900"

                android:endColor="#8B5200" /\>

            \<stroke

                android:width="2dp"

                android:color="#FFB020" /\>

        \</shape\>

    \</item\>

\</selector\>

Button Confirm

\<?xml version="1.0" encoding="utf-8"?\>

\<selector xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<item android:state_pressed="true"\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#0D6B30"

                android:endColor="#21D766" /\>

            \<stroke

                android:width="2dp"

                android:color="#7BFF9D" /\>

        \</shape\>

    \</item\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="18dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#062A16"

                android:endColor="#0B813A" /\>

            \<stroke

                android:width="2dp"

                android:color="#48FF7A" /\>

        \</shape\>

    \</item\>

\</selector\>

Number button (Login)

\<?xml version="1.0" encoding="utf-8"?\>

\<selector xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<!-- PRITISNUTA TIPKA --\>

    \<item android:state_pressed="true"\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="50dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#0A5FB8"

                android:centerColor="#087FE8"

                android:endColor="#00A8FF" /\>

            \<stroke

                android:width="2dp"

                android:color="#55C7FF" /\>

        \</shape\>

    \</item\>

    \<!-- NORMALNO STANJE --\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<corners android:radius="50dp" /\>

            \<gradient

                android:angle="270"

                android:startColor="#061A3A"

                android:centerColor="#082B5A"

                android:endColor="#073D78" /\>

            \<stroke

                android:width="2dp"

                android:color="#168BFF" /\>

        \</shape\>

    \</item\>

\</selector\>

I onda na PIN buttone:

\<Button

    android:id="@+id/btn1"

    android:layout_width="72dp"

    android:layout_height="72dp"

    android:background="@drawable/btn_pin_number"

    android:text="1"

    android:textColor="#FFFFFF"

    android:textSize="28sp"

    android:textStyle="bold"

    android:stateListAnimator="@null" /\>

Na obične buttone:

\<Button

    android:id="@+id/btnOk"

    android:layout_width="0dp"

    android:layout_height="56dp"

    android:text="U REDU"

    android:textColor="@android:color/white"

    android:textStyle="bold"

    android:textSize="18sp"

    android:background="@drawable/btn_ok" /\>

Layout dijaloga:

\<?xml version="1.0" encoding="utf-8"?\>

\<layer-list xmlns:android="http://schemas.android.com/apk/res/android"\>

    \<!-- Vanjski plavi rub --\>

    \<item\>

        \<shape android:shape="rectangle"\>

            \<solid android:color="#087EFF" /\>

            \<corners android:radius="26dp" /\>

        \</shape\>

    \</item\>

    \<!-- Unutarnji tamni dio --\>

    \<item

        android:left="2dp"

        android:top="2dp"

        android:right="2dp"

        android:bottom="2dp"\>

        \<shape android:shape="rectangle"\>

            \<gradient

                android:angle="270"

                android:startColor="#071D3C"

                android:centerColor="#04152F"

                android:endColor="#020A19" /\>

            \<corners android:radius="24dp" /\>

            \<!-- tanki unutarnji plavi rub --\>

            \<stroke

                android:width="1dp"

                android:color="#42A5FF" /\>

        \</shape\>

    \</item\>

\</layer-list\>
