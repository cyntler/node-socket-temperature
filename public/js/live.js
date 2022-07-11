const socket = io();
const tableBody = document.querySelector('tbody');

function insertNewCalculation(data) {
  if (!data.temperatures.filter((temp) => temp === null).length) {
    tableBody.insertAdjacentHTML(
      'afterbegin',
      `
      <tr>
        <td>${data.date}</td>
        ${data.temperatures
          .map((temp) =>
            temp
              ? `<td style="color: ${temp.valueColor};">${temp.value} °C</td>`
              : '<td>Błędne dane</td>'
          )
          .join('')}
      </tr>
    `
    );
  }
}

socket.on('data', function (data) {
  insertNewCalculation(data);
});
