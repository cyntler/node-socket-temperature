const socket = io();
const tableBody = document.querySelector('tbody');

function insertNewCalculation(data) {
  tableBody.insertAdjacentHTML('beforeend', `
    <tr>
      <td>${data.date}</td>
      ${data.temperatures.map(temp => `<td style="color: ${temp.value >= window.warningTemperature ? 'red' : 'green'};">${temp.value} °C</td>`).join('')}
    </tr>
  `);
}

socket.on('data', function (data) {
  insertNewCalculation(data);
});
