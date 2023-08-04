import { detectType, setStorage, detectIcon  } from "./helpers.js";

//! HTML'den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");

//! Olay izleyicileri
form.addEventListener("submit",handleSumbit);
list.addEventListener("click", handleClick);

//! ortak kullanım alanı (global değişken tanımlama)
var map;
var notes = JSON.parse(localStorage.getItem("notes")) || [];
var coords = [];
var layerGroup = [];

//! kullanıcının konumunu öğrenme
navigator.geolocation.getCurrentPosition(
    loadMap,
    console.log("Kullanıcı Kabul Etmedi.")
);


//! haritaya tıklanınca çalışan fonksiyon
function onMapClick(e){
    form.style.display = "flex";
    coords = [e.latlng.lat, e.latlng.lng];
}

//! kullanıcının konumuna göre ekranı haritaya basma
function loadMap(e){

    // haritanın kurulumunu yapan kod
// istanbul koordinatları enlen ve boylama göre
 map = L.map('map').setView(
    [e.coords.latitude, e.coords.longitude], 14);


// haritanın nasıl gözükeceğini belirler
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// haritada ekrana basılacak imleçleri tutacağımız katman(layer)
 layerGroup = L.layerGroup().addTo(map);

 // local'den gelen notları listeleme
 renderNoteList(notes);

// haritada bir tıklanma olduğunda çalışacak fonksiyon
map.on('click', onMapClick);
}

//! ekrana marker( imleç ) basma
function renderMarker(item){
    // marker oluşturma
    L.marker(item.coords, {icon: detectIcon(item.status)})
    // imleçlerin olduğu katmana ekler
    .addTo(layerGroup)
    // üzerine tıklanınca açılacak popup ekleme
    .bindPopup(`${item.desc}`)
}

//! Formun gönderilmesi olayında çalışır
function handleSumbit(e){
    e.preventDefault();

    const desc = e.target[0].value;
    const date = e.target[1].value;
    const status = e.target[2].value;

    


// notlar dizisine eleman ekleme
    notes.push({
        id:new Date().getTime(), 
        desc,
        date,
        status,
        coords});

        // local storage'ı güncelleme
        setStorage(notes);

        // notları listeleme
    renderNoteList(notes);

    // formu kapatma
    form.style.display = "none";
}

// ekrana notları basma fonksiyonu
function renderNoteList(items){   
    // note'lar alanını temizler
    list.innerHTML = "";

    //imleçleri temizler
    layerGroup.clearLayers();

    // her bit note için fonksiyon çalıştırır
    items.forEach((item)=>{
        // li elemanı oluşturma
       const listEle = document.createElement("li");

       // data'sına sahip olduğu id'yi ekleme
       listEle.dataset.id = item.id;

       // içeriği belirleme
       listEle.innerHTML= `
       <div>
            <p>${item.desc}</p>
            <p> <span>Tarih: </span> ${item.date}</p>
            <p> <span>Durum: </span> ${detectType(item.status)}</p>
       </div>
       <i id="fly" class="bi bi-airplane-fill"></i>
       <i id="delete" class="bi bi-trash3-fill"></i>
       `;

       // HTML'deki listeye ekelmanı ekleme
        list.insertAdjacentElement("afterbegin",listEle);

        // ekrana marker (imleç) basma
        renderMarker(item);
    });
}

// Notlar alanın tıklanma olayını izleme
function handleClick(e){
    // güncellenecek elemanın id'sini öğrenme
const id = e.target.parentElement.dataset.id;
    if(e.target.id === "delete"){

    // id'sini bulduğumuz elemanı diziden kaldırma
   notes = notes.filter((note)=> note.id != id)

   // local storage'i güncelleme
   setStorage(notes);

   // ekranı güncelleme
   renderNoteList(notes);

    }

    if(e.target.id === "fly"){
      const note =  notes.find((note) => note.id == id);

      map.flyTo(note.coords,15);
    }
}

