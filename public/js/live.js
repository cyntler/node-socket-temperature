const socket = io();
const tableBody = document.querySelector('tbody');

function insertNewCalculation(data) {
  tableBody.insertAdjacentHTML(
    'afterbegin',
    `
    <tr>
      <td>${data.date}</td>
      ${data.temperatures
        .map(
          (temp) =>
            `<td style="color: ${temp.valueColor};">${temp.value} °C</td>`
        )
        .join('')}
    </tr>
  `
  );
}

socket.on('data', function (data) {
  insertNewCalculation(data);
});
