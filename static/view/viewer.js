(function () {
  const BASE_URL = "http://localhost:8081";
  const cleanItem = (event) => {
    return {
      ...event,
      event: {
        ...event.event,
        parameters: {
          ...event.event.parameters,
          cx:
            event.event.parameters.cx &&
            JSON.parse(atob(event.event.parameters.cx)),
        },
      },
    };
  };
  const goodTBodyElement = document.querySelector(".good tbody");
  const totalElement = document.querySelector(".total");
  const goodTotalElement = document.querySelector(".good");
  const badTotalElement = document.querySelector(".bad");
  const getTotals = async () => {
    try {
      const response = await fetch(`${BASE_URL}/micro/all`);
      const totalsJson = await response.json();
      totalElement.innerHTML = totalsJson.total;
      goodTotalElement.innerHTML = totalsJson.good;
      badTotalElement.innerHTML = totalsJson.bad;

      const goodDataResponse = await fetch(`${BASE_URL}/micro/good`);
      const goodDataJson = await goodDataResponse.json();
      goodDataJson.reverse().forEach((event, i) => {
        if (document.querySelector(`.row-${event.event.parameters.eid}`))
          return;
        const element = document.createElement("tr");
        element.innerHTML = `<td>${event.event.context.timestamp}</td><td class="data"></td>`;
        element.classList.add(`row-${event.event.parameters.eid}`);

        if (goodTBodyElement.firstChild) {
          goodTBodyElement.insertBefore(element, goodTBodyElement.firstChild);
        } else {
          goodTBodyElement.appendChild(element);
        }
        jsonView.format(
          cleanItem(event),
          `.row-${event.event.parameters.eid} .data`
        );
      });
    } catch (err) {
      console.error("Failed to get totals");
    }
  };

  window.clearData = async () => {
    await fetch(`${BASE_URL}/micro/reset`);
    goodTBodyElement.innerHTML = "";
  };

  getTotals();
  setInterval(getTotals, 2000);
})();
