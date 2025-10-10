// Daten-Keys für LocalStorage
const FAHRER_KEY = 'fahrerListe';
const FAHRTEN_KEY = 'fahrtenListe';

// Fahrer laden/speichern
function loadFahrer() {
    return JSON.parse(localStorage.getItem(FAHRER_KEY)) || [];
}
function saveFahrer(fahrer) {
    localStorage.setItem(FAHRER_KEY, JSON.stringify(fahrer));
}

// Fahrten laden/speichern
function loadFahrten() {
    return JSON.parse(localStorage.getItem(FAHRTEN_KEY)) || [];
}
function saveFahrten(fahrten) {
    localStorage.setItem(FAHRTEN_KEY, JSON.stringify(fahrten));
}

// Fahrer-Form
const fahrerForm = document.getElementById('fahrerForm');
fahrerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fahrerName').value;
    const handy = document.getElementById('fahrerHandy').value;
    const fahrer = loadFahrer();
    fahrer.push({ name, handy });
    saveFahrer(fahrer);
    fahrerForm.reset();
    renderFahrer();
    updateFahrerSelect();
});

// Fahrer rendern
function renderFahrer() {
    const liste = document.getElementById('fahrerListe');
    const fahrer = loadFahrer();
    liste.innerHTML = '<h3>Verfügbare Fahrer:</h3><ul>' + fahrer.map(f => `<li>${f.name} (${f.handy}) <button onclick="deleteFahrer('${f.name}')">Löschen</button></li>`).join('') + '</ul>';
}
function deleteFahrer(name) {
    let fahrer = loadFahrer();
    fahrer = fahrer.filter(f => f.name !== name);
    saveFahrer(fahrer);
    renderFahrer();
    updateFahrerSelect();
}

// Fahrer-Select updaten
function updateFahrerSelect() {
    const select = document.getElementById('fahrerSelect');
    const fahrer = loadFahrer();
    select.innerHTML = '<option value="">Fahrer wählen</option>' + fahrer.map(f => `<option value="${f.name}">${f.name}</option>`).join('');
}

// Fahrt-Form
const fahrtForm = document.getElementById('fahrtForm');
fahrtForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fahrt = {
        datum: document.getElementById('datum').value,
        zeit: document.getElementById('zeit').value,
        anAb: document.getElementById('anAb').value,
        ort: document.getElementById('ort').value,
        flugNr: document.getElementById('flugNr').value,
        pers: document.getElementById('pers').value,
        fahrer: document.getElementById('fahrerSelect').value,
        gast: document.getElementById('gast').value,
        handy: document.getElementById('handy').value,
        bemerkung: document.getElementById('bemerkung').value
    };
    const fahrten = loadFahrten();
    fahrten.push(fahrt);
    saveFahrten(fahrten);
    fahrtForm.reset();
    updateFahrerSelect(); // Reset Select
    renderTabelle();
});

// Tabelle rendern
function renderTabelle() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('tabelleContainer');
    const tbody = document.querySelector('#fahrtenTabelle tbody');
    const fahrten = loadFahrten().sort((a, b) => new Date(a.datum + ' ' + a.zeit) - new Date(b.datum + ' ' + b.zeit));
    
    if (fahrten.length === 0) {
        loading.textContent = 'Keine Daten vorhanden. Füge eine Fahrt hinzu!';
        container.style.display = 'none';
        return;
    }
    
    tbody.innerHTML = fahrten.map((f, i) => `
        <tr>
            <td>${f.datum}</td><td>${f.zeit}</td><td>${f.anAb}</td><td>${f.ort}</td><td>${f.flugNr}</td>
            <td>${f.pers}</td><td>${f.fahrer}</td><td>${f.gast}</td><td>${f.handy}</td><td>${f.bemerkung}</td>
            <td><button onclick="deleteFahrt(${i})">Löschen</button></td>
        </tr>
    `).join('');
    
    loading.style.display = 'none';
    container.style.display = 'block';
}
function deleteFahrt(index) {
    let fahrten = loadFahrten();
    fahrten.splice(index, 1);
    saveFahrten(fahrten);
    renderTabelle();
}

// CSV-Export
document.getElementById('exportBtn').addEventListener('click', () => {
    const fahrten = loadFahrten();
    const csv = ['Datum,Zeit,An/Ab,Ort,FlugNr.,#Pers,Fahrer,Gast,Handy,Bemerkung'].concat(fahrten.map(f => `${f.datum},${f.zeit},${f.anAb},${f.ort},${f.flugNr},${f.pers},${f.fahrer},${f.gast},${f.handy},${f.bemerkung.replace(/,/g, ';')}`)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'fahrten.csv'; a.click();
});

// CSV-Import
document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const lines = ev.target.result.split('\n').slice(1); // Skip Header
        const fahrten = lines.map(line => {
            const [datum, zeit, anAb, ort, flugNr, pers, fahrer, gast, handy, bemerkung] = line.split(',');
            return { datum, zeit, anAb, ort, flugNr, pers, fahrer, gast, handy, bemerkung: bemerkung.replace(/;/g, ',') };
        }).filter(f => f.datum); // Filter empty
        saveFahrten(fahrten);
        renderTabelle();
    };
    reader.readAsText(file);
});

// Initialisierung
updateFahrerSelect();
renderFahrer();
renderTabelle();