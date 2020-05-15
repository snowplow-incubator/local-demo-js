(function () {
  const goodTBodyElement = document.querySelector(".good tbody");
  const totalElement = document.querySelector(".total");
  const goodTotalElement = document.querySelector(".good");
  const badTotalElement = document.querySelector(".bad");
  let total = 0;
  let good = 0;
  let bad = 0;
  var socket = io.connect("/");
  socket.on("snowplowEvent", (event) => {
    const element = document.createElement("tr");
    element.innerHTML = `<td>${event.id}</td><td class="data"></td>`;

    element.classList.add(`row-${event.id}`);

    if (goodTBodyElement.firstChild) {
      goodTBodyElement.insertBefore(element, goodTBodyElement.firstChild);
    } else {
      goodTBodyElement.appendChild(element);
    }

    jsonView.format(event, `.row-${event.id} .data`);
    total++;
    good++;
    totalElement.innerHTML = total.toString();
    goodTotalElement.innerHTML = good.toString();
  });
})();
