function buscarCEP(){
    let cep =document.getElementById('inputCEpClient').value
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
    fetch(urlAPI)
        .then(response=> response.json())
        .then(dados => {
            document.getElementById('inputLogradouroClient').value = dados.logradouro
            document.getElementById('inputBAIClient').value = dados.bairro
            document.getElementById('inputESTClient').value = dados.localidade
            document.getElementById('uf').value = dados.uf

        } )
        .catch(error => console.log(error)
        )
    }
    function teste(){
        let lap=document.getElementById('floatingTextarea').value
       
    }
let arrayClient = []
const foco = document.getElementById('searchClient')
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true

    foco.focus()
})
let frmClient = document.getElementById("frmClient")
let nameClient = document.getElementById("inputNameClient")
let cpfClient = document.getElementById("inputCPFClient")
let emailClient = document.getElementById("inputEmailClient")
let phoneClient = document.getElementById("inputTelefoneClient")
let cepClient = document.getElementById("inputCEpClient")
let addressClient = document.getElementById("inputLogradouroClient")
let numberClient = document.getElementById("inputNUMClient")
let complementClient = document.getElementById("inputCOMClient")
let bairroClient = document.getElementById("inputBAIClient")
let cityClient = document.getElementById("inputESTClient")
let ufClient = document.getElementById("uf")
let id = document.getElementById('idClient')

function teclaEnter(event){
    if (event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    } 
}
function restaurarEnter(){
    frmClient.removeEventListener('keydown', teclaEnter)
}
frmClient.addEventListener('keydown', teclaEnter)
frmClient.addEventListener("submit", async(event)=> {
    event.preventDefault()
let cpfSemFormatacao = cpfClient.value.replace(/\D/g, "");
    if (!validarCPF()) {
        window.api.showErrorBox("CPF inválido! Corrija antes de continuar.");
        return;    
    }
  if (id.value === "") {
    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfSemFormatacao,
        emailCli: emailClient.value,
        phoneCli: phoneClient.value,
        cepCli: cepClient.value
        ,addressCli: addressClient.value,
        numberCli: numberClient.value,
        complementCli: complementClient.value,
        bairroCli: bairroClient.value,
        cityCli: cityClient.value,
        ufCli: ufClient.value
    }
    api.newClient(client)
} else {
    const client = {
        idCli: id.value,
        nameCli: nameClient.value,
        cpfCli: cpfSemFormatacao,
        emailCli: emailClient.value,
        phoneCli: phoneClient.value,
        cepCli: cepClient.value
        ,addressCli: addressClient.value,
        numberCli: numberClient.value,
        complementCli: complementClient.value,
        bairroCli: bairroClient.value,
        cityCli: cityClient.value,
        ufCli: ufClient.value
    }
    api.updateClient(client)

}})
function buscarCliente () {
   let name = document.getElementById('searchClient').value
 
   if (name ===""){
    api.validateSearch()
    foco.focus()
    

    }else{
    api.searchNameClient(name)
    api.renderClient((event,dataClient)=>{
    
    const dadosCliente = JSON.parse(dataClient)
    arrayClient = dadosCliente
    arrayClient.forEach((c)=> {
        id.value = c._id,
        nameClient.value = c.nomeClient,
        cpfClient.value = c.cpfCliente,
        emailClient.value = c.emailCliente,
        phoneClient.value = c.phoneCliente,
        cepClient.value = c.cepCliente,
        addressClient.value = c.addressCliente,
        numberClient.value = c.numberCliente,
        complementClient.value = c.complementCliente,
        bairroClient.value = c.bairroCliente,
        cityClient.value = c.cityCliente,
        ufClient.value = c.ufCliente
        btnCreate.disabled = true
        btnUpdate.disabled = false
        btnDelete.disabled = false

    })
   })
   }
   
}


api.setClient((args) => {
    let campoBusca = document.getElementById('searchClient').value.trim()

    
    if (/^\d{11}$/.test(campoBusca)) {
    
        cpfClient.focus()
        foco.value = ""
        cpfClient.value = campoBusca
    } 
    else if(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(campoBusca)){
        cpfClient.focus()
        foco.value = ""
        cpfClient.value = campoBusca
    }
    else {
     
        nameClient.focus()
        foco.value = ""
        nameClient.value = campoBusca
    }
})
function excluirClient() {
   
    api.deleteClient(id.value)
}
function resetForm() {
location.reload()
}

api.resetForm((args)=>{
    resetForm()
})

function aplicarMascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, "");

    if (cpf.length > 3) cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
    if (cpf.length > 6) cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cpf.length > 9) cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

    campo.value = cpf;
}

function validarCPF() {
    const cpf = cpfClient.value.replace(/\D/g, "");
    cpfClient.classList.remove("input-valido", "input-invalido");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        cpfClient.classList.add("input-invalido");
        return false;
    }

    let soma = 0, resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        cpfClient.classList.add("input-invalido");
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        cpfClient.classList.add("input-invalido");
        return false;
    }

    cpfClient.classList.add("input-valido");
    return true;
}
cpfClient.addEventListener("input", () => aplicarMascaraCPF(cpfClient));
cpfClient.addEventListener("blur", validarCPF);