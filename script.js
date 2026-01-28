/*
 * TODO:
 * 1. Dapatkan Kunci API Google Anda dan aktifkan Google Sheets API.
 *    - Buka Google Cloud Console: https://console.cloud.google.com/
 *    - Buat proyek baru.
 *    - Buka "APIs & Services" > "Library".
 *    - Cari dan aktifkan "Google Sheets API".
 *    - Buka "APIs & Services" > "Credentials".
 *    - Klik "Create Credentials" > "API key".
 * 2. Ganti 'YOUR_API_KEY' di bawah dengan kunci API yang Anda dapatkan.
 * 3. Dapatkan ID Google Sheet Anda dari URL (misalnya, https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit).
 * 4. Ganti 'YOUR_SHEET_ID' dengan ID sheet Anda.
 * 5. Pastikan sheet Anda "public" (siapa saja yang memiliki link dapat melihat).
 */

// PENTING: Ganti dengan Kunci API Anda. Jangan unggah kunci ini ke GitHub.
const API_KEY = 'YOUR_API_KEY';
const SHEET_ID = '1T9JCQPyOEjAAh-O_uQda_GhvZdvVMiG9rlhYOslXiZU';
// Add the date column range B5:B219 for filtering purposes
const RANGES = ['Sheet1!D5:D219', 'Sheet1!E5:E219', 'Sheet1!H5:H219', 'Sheet1!B5:B219'];

// Fungsi bantuan untuk mem-parsing tanggal dari format sheet (mis. DD/MM/YYYY)
function parseSheetDate(dateString) {
    if (typeof dateString !== 'string') return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
        // Format: DD/MM/YYYY -> new Date(YYYY, MM-1, DD)
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    // Fallback jika formatnya sudah dikenali oleh new Date()
    const d = new Date(dateString);
    return isNaN(d) ? null : d;
}

function handleClientLoad() {
  gapi.load('client', initClient);
}

function initClient() {
  gapi.client.init({
    'apiKey': API_KEY,
    'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  }).then(() => {
    loadSheetData(true);
    document.getElementById('filter-btn').addEventListener('click', () => {
        loadSheetData(false);
    });
    document.getElementById('copy-table-btn').addEventListener('click', copyTableToClipboard);
  });
}

let allSheetData = [];

function loadSheetData(initialLoad = false) {
    const processData = (data) => {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const filteredData = filterDataByDate(data, startDate, endDate);
        const tableContainer = document.getElementById('table-container');
        tableContainer.innerHTML = createTable(filteredData);
    };

    if (initialLoad) {
        gapi.client.sheets.spreadsheets.values.batchGet({
            spreadsheetId: SHEET_ID,
            ranges: RANGES,
        }).then(response => {
            const valueRanges = response.result.valueRanges;

            // Define headers for the visible columns, and a hidden 'Date' column for filtering
            const header = ['Column D', 'Column E', 'Column H', 'Date'];

            const colD = valueRanges[0].values || [];
            const colE = valueRanges[1].values || [];
            const colH = valueRanges[2].values || [];
            const colB_Date = valueRanges[3].values || []; // Date column

            const dataRows = [];
            const numRows = Math.max(colD.length, colE.length, colH.length, colB_Date.length);

            for (let i = 0; i < numRows; i++) {
                const row = [
                    colD[i] ? colD[i][0] : '',
                    colE[i] ? colE[i][0] : '',
                    colH[i] ? colH[i][0] : '',
                    colB_Date[i] ? colB_Date[i][0] : '' // Add date data to the row
                ];
                dataRows.push(row);
            }

            allSheetData = [header, ...dataRows];
            processData(allSheetData);
        }, err => {
            console.error("Error memuat data dari Google Sheet: ", err);
            const tableContainer = document.getElementById('table-container');
            tableContainer.innerText = 'Error memuat data. Pastikan Kunci API, ID Sheet, dan rentang sudah benar, dan sheet Anda bersifat publik.';
        });
    } else {
        processData(allSheetData);
    }
}

function filterDataByDate(data, startDate, endDate) {
    if (!data || data.length === 0) return [];
    const header = data[0];
    const dateColumnIndex = header.indexOf('Date');
    let dataRows = data.slice(1);

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (dateColumnIndex === -1) {
            console.error("Date column not found for filtering.");
            return data; // Return original data if no date column
        }

        dataRows = dataRows.filter(row => {
            if (!row[dateColumnIndex]) return false;
            const rowDate = parseSheetDate(row[dateColumnIndex]);
            if (!rowDate) return false;
            return rowDate >= start && rowDate <= end;
        });
    }

    return [header, ...dataRows];
}

function createTable(data) {
  if (!data || data.length <= 1) {
    return '<p>Tidak ada data untuk ditampilkan untuk rentang tanggal yang dipilih.</p>';
  }

  let table = '<table>';
  table += '<thead><tr>';
  const header = data[0];
  const dateColumnIndex = header.indexOf('Date');

  header.forEach((headerCell, index) => {
    // Hide the 'Date' column header
    if (index !== dateColumnIndex) {
        table += `<th>${headerCell}</th>`;
    }
  });
  table += '</tr></thead>';

  table += '<tbody>';
  const dataRows = data.slice(1);
  dataRows.forEach(row => {
    table += '<tr>';
    row.forEach((cell, index) => {
        // Hide the cell in the 'Date' column
        if (index !== dateColumnIndex) {
            table += `<td>${cell || ''}</td>`;
        }
    });
    table += '</tr>';
  });
  table += '</tbody></table>';
  return table;
}

function copyTableToClipboard() {
    const tableContainer = document.getElementById('table-container');
    const table = tableContainer.querySelector('table');

    if (!table) {
        alert("Tidak ada tabel untuk disalin.");
        return;
    }

    // Dengan menambahkan gaya CSS langsung ke HTML yang disalin, kita dapat memastikan rendering yang konsisten di aplikasi lain.
    const styles = `
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
        </style>
    `;

    const htmlToCopy = styles + table.outerHTML;

    // Buat item clipboard dengan tipe text/html untuk mempertahankan pemformatan
    const blob = new Blob([htmlToCopy], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });

    navigator.clipboard.write([clipboardItem]).then(() => {
        alert('Tabel berhasil disalin ke clipboard!');
    }).catch(err => {
        console.error('Gagal menyalin tabel: ', err);
        alert('Gagal menyalin tabel. Coba salin secara manual.');
    });
}

// Panggil handleClientLoad saat skrip dimuat
handleClientLoad();
