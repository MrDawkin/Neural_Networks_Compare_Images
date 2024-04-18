const ruch = document.getElementById("licznik-posuniec");
const czas = document.getElementById("czas");
const przyciskStartu = document.getElementById("wystartuj-gre");
const przyciskZatrzymania = document.getElementById("zatrzymaj-gre");
const gameContainer = document.querySelector(".game-container");
const wyniki = document.getElementById("wyniki");
const sterowanie = document.querySelector(".controls-container");
let karty;
let przerwa;
let pierwszaKarta = false;
let drugaKarta = false;

// Tablica z elementami
const elementy = [
    { name: "pies1", image: "/static/images/piesek1.jpg" },
    { name: "pies2", image: "/static/images/piesek2.jpg" },
    { name: "pies3", image: "/static/images/piesek3.jpg" },
    { name: "pies4", image: "/static/images/piesek4.jpg" },
    { name: "pies5", image: "/static/images/piesek5.jpg" },
    { name: "pies6", image: "/static/images/piesek6.jpg" },
    { name: "kot1", image: "/static/images/kotek1.jpg" },
    { name: "kot2", image: "/static/images/kotek2.jpg" },
    { name: "kot3", image: "/static/images/kotek3.jpg" },
    { name: "kot4", image: "/static/images/kotek4.jpg" },
    { name: "kot5", image: "/static/images/kotek5.jpg" },
    { name: "kot6", image: "/static/images/kotek6.jpg" },
];

// Wstępny czas
let sekundy = 0,
    minuty = 0;

let licznikPosuniec = 0,
    licznikZwyciestw = 0;

// Pomiar czasu
const generatorCzasu = () => {
    sekundy += 1;
    if (sekundy >= 60) {
        minuty += 1;
        sekundy = 0;
    }
    // Format przedstawienia czasu
    let sekundyWartosc = sekundy < 10 ? `0${sekundy}` : sekundy;
    let minutyWartosc = minuty < 10 ? `0${minuty}` : minuty;
    czas.innerHTML = `<span>Czas: </span>${minutyWartosc}:${sekundyWartosc}`;
};

// Pomiar posunięć
const licznikPos = () => {
    licznikPosuniec += 1;
    ruch.innerHTML = `<span>Posunięcia:</span> ${licznikPosuniec}`;
};

// Wybór losowych obiektów z tablicy elementów
const generatorLosowy = (wielkosc = 4) => {
    // Tymczasowa tablica
    let tymTablica = [...elementy];
    // Wartości wejściowe kart tablicy
    let kartyWartosc = [];
    wielkosc = (wielkosc * wielkosc) / 2;
    // Wybór losowych obiektów
    for (let i = 0; i < wielkosc; i++) {
        const losowyIndex = Math.floor(Math.random() * tymTablica.length);
        kartyWartosc.push(tymTablica[losowyIndex]);
        // Usuwanie zaznaczonego elementu z tablicy
        tymTablica.splice(losowyIndex, 1);
    }
    return kartyWartosc;
};

const generatorMacierzy = (kartyWartosc, wielkosc = 4) => {
    gameContainer.innerHTML = "";
    kartyWartosc = [...kartyWartosc, ...kartyWartosc];
    // Przetasowanie kart
    kartyWartosc.sort(() => Math.random() - 0.5);
    for (let i = 0; i < wielkosc * wielkosc; i++) {
        gameContainer.innerHTML += `
        <div class="card-container" data-card-value="${kartyWartosc[i].name}">
            <div class="card-before">?</div>
            <div class="card-after">
                <img src="${kartyWartosc[i].image}" class="image"/>
            </div>
        </div>`;
    }

    gameContainer.style.gridTemplateColumns = `repeat(${wielkosc}, auto)`;

    // Karty
    karty = document.querySelectorAll(".card-container");
    karty.forEach((karta) => {
        karta.addEventListener("click", () => {
            if (!karta.classList.contains("matched") && !przerwa) {
                karta.classList.add("flipped");

                if (!pierwszaKarta) {
                    pierwszaKarta = karta;

                    pierwszaKartaWartosc = karta.getAttribute("data-card-value");
                } else {
                    licznikPos();
                    drugaKarta = karta;
                    let drugaKartaWartosc = karta.getAttribute("data-card-value");
                    if (pierwszaKartaWartosc === drugaKartaWartosc) {
                        pierwszaKarta.classList.add("matched");
                        drugaKarta.classList.add("matched");
                        pierwszaKarta = false;
                        drugaKarta = false;
                        licznikZwyciestw += 1;
                        if (licznikZwyciestw === Math.floor(kartyWartosc.length / 2)) {
                            wyniki.innerHTML = `<h1>Wygrales</h1>
                            <h4>Posuniecia: ${licznikPosuniec}</h4>`;
                            zatrzymajGre();
                        }
                    } else {
                        przerwa = true;
                        setTimeout(() => {
                            pierwszaKarta.classList.remove("flipped");
                            drugaKarta.classList.remove("flipped");
                            pierwszaKarta = false;
                            drugaKarta = false;
                            przerwa = false;
                        }, 900);
                    }
                }
            }
        });
    });
};

let interval; // Dodaj zmienną do przechowywania interwału

przyciskStartu.addEventListener("click", () => {
    licznikPosuniec = 0;
    sekundy = 0;
    minuty = 0;
    sterowanie.classList.add("chowaj");
    przyciskZatrzymania.classList.remove("chowaj");
    przyciskStartu.classList.add("chowaj");

    interval = setInterval(generatorCzasu, 1000); // Uruchom interwał do pomiaru czasu
    ruch.innerHTML = `<span>Posunięcia:</span> ${licznikPosuniec}`;
    inicjalizator();
});

przyciskZatrzymania.addEventListener("click",() => {
        zatrzymajGre();
 });

const zatrzymajGre = () => {
    sterowanie.classList.remove("chowaj");
    przyciskZatrzymania.classList.add("chowaj");
    przyciskStartu.classList.remove("chowaj");
    clearInterval(interval); // Zatrzymaj interwał
};

const inicjalizator = () => {
    wyniki.innerText = "";
    licznikZwyciestw = 0;
    let kartyWartosc = generatorLosowy();
    console.log(kartyWartosc);
    generatorMacierzy(kartyWartosc);
};
