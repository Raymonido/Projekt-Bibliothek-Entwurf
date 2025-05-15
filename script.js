async function getAllAdresses() {
    let endpoint = "http://localhost:8080/api/address/get/all"
    const request = await fetch(endpoint, {method: "GET"});
    let allAddresses = await request.json();
    renderAdresses(allAddresses)
}


getAllAdresses()

function renderAdresses(address) {
    const row = document.getElementById('addressRow');
    row.innerHTML = "";

    address.forEach(address => {
        const col = document.createElement("div");
        col.className = "col-md-3 my-3";

        col.innerHTML = `
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${address.address}</h5>
                    <h6 class="card-subtitle mb-2 text-body-secondary">${address.city}</h6>
                    <p class="card-text">${address.zip}</p>
                    <div class="d-flex justify-content-end">
                     <a href="#" class="card-link edit-link" data-id="${address.id}" 
                           data-address="${address.address}" 
                           data-city="${address.city}" 
                           data-zip="${address.zip}" 
                           data-bs-toggle="modal" data-bs-target="#editAddressModal"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
  <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
</svg></a>
                    </div>
                </div>
            </div>
        `;
        row.appendChild(col);
    });
    document.querySelectorAll('.edit-link').forEach(link => {
        link.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const address = this.getAttribute('data-address');
            const city = this.getAttribute('data-city');
            const zip = this.getAttribute('data-zip');

            document.getElementById('updateAddress').value = address;
            document.getElementById('updateCity').value = city;
            document.getElementById('updateZip').value = zip;
            document.getElementById('editCustomerAddressLabel').innerHTML = address + " Bearbeiten";

            document.getElementById('editAddressForm').setAttribute('data-id', id);
            document.getElementById('editAddressForm').setAttribute('data-address', address);
            document.getElementById('deleteButton').setAttribute('data-id', id);
            document.getElementById('deleteButton').setAttribute('data-address', address)
        });
    });

}


async function createAddress(data) {
    let endpoint = "http://localhost:8080/api/address/create";
    const request = await fetch(endpoint, {method: "POST",  headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)});
    return await request.json();
}

async function updateAddress(data, id) {
    let endpoint = `http://localhost:8080/api/address/update/${id}`;
    const request = await fetch(endpoint, {method: "PATCH", headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)});
    return await request.json();
}

async function deleteAddress(id) {
    const endpoint = `http://localhost:8080/api/address/delete/${id}`
    await fetch(endpoint, {method: "DELETE"});
}

async function searchAddress(data) {
    const headers = { 'Content-Type': 'application/json' };

    const addressResponse = await fetch(`http://localhost:8080/api/address/get/address/${encodeURIComponent(data)}`, { headers });
    const addresses = await addressResponse.json();

    if (addresses.length > 0) {
        return renderAdresses(addresses);
    }

    const zipResponse = await fetch(`http://localhost:8080/api/address/get/zip/${encodeURIComponent(data)}`, { headers });
    const zips = await zipResponse.json();

    if (zips.length > 0) {
        return renderAdresses(zips);
    }


    const cityResponse = await fetch(`http://localhost:8080/api/address/get/city/${encodeURIComponent(data)}`, { headers });
    const cities = await cityResponse.json();

    if (cities.length > 0) {
        return renderAdresses(cities);
    }

    showBootstrapAlert("Keine Suchergebnisse gefunden")
}

function showBootstrapAlert(message, type = 'warning') {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    setTimeout(() => {
        const alert = container.querySelector('.alert');
        if (alert) {
            bootstrap.Alert.getOrCreateInstance(alert).close();
        }
    }, 3000);
}

document.getElementById('editForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    let allFieldsFilled = true;

    for (const [key, value] of formData.entries()) {
        if (value.trim() === '') {
            allFieldsFilled = false;
            break;
        }
        data[key] = value.trim();
    }

    if (!allFieldsFilled) {
        alert("Bitte fülle alle Felder aus.");
        return;
    }

    await createAddress(data)

    const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    modal.hide();

    const toast = document.getElementById("toast")
    const toastBody = document.getElementById('toastBody')
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

    toastBody.innerHTML = "Adresse (" + data.address + ") wurde erfolgreich erstellt!"

    toastBootstrap.show();

    await getAllAdresses();

    form.reset();
});


document.getElementById('editAddressForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;
    const id = form.getAttribute('data-id');
    const address = form.getAttribute('data-address');
    console.log(id)
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            data[key] = value.trim();
        }
    }
    console.log(data)

    await updateAddress(data, id);

    const modal = bootstrap.Modal.getInstance(document.getElementById('editAddressModal'));
    modal.hide();

    const toast = document.getElementById("toast")
    const toastBody = document.getElementById('toastBody')
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

    toastBody.innerHTML = "Adresse (" + address + ") wurde erfolgreich geändert!"

    await getAllAdresses();

    toastBootstrap.show();
});

document.getElementById('deleteButton').addEventListener('click', async function () {
    let id = document.getElementById('deleteButton').getAttribute('data-id');
    let address = document.getElementById('deleteButton').getAttribute('data-address')

    await deleteAddress(id);

    const modal = bootstrap.Modal.getInstance(document.getElementById('editAddressModal'));
    modal.hide();

    const toast = document.getElementById("toast")
    const toastBody = document.getElementById('toastBody')
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);

    toastBody.innerHTML = "Adresse (" + address + ") wurde erfolgreich gelöscht!"

    await getAllAdresses();

    toastBootstrap.show();

});

document.getElementById('searchBar').addEventListener('submit', function (e) {
    e.preventDefault();

    let input = document.getElementById('search').value.trim();

    if (input.length > 0) {
        searchAddress(input);
    } else getAllAdresses();


})

