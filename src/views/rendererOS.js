


let frmOS = document.getElementById("frmOS")
let statusOS = document.getElementById("maintenance-type")
let funcioOs = document.getElementById("inputNameFuncionario")
let bikeOs = document.getElementById("inputBIKEClient")
let numS = document.getElementById("inputNUMClient")
let cor = document.getElementById("color")
let manutencao = document.getElementById("maintenance-typeT")
let previsao = document.getElementById("inputprevisaoClient")
let obsC = document.getElementById("floatingTextareaC")
let obsF = document.getElementById("floatingTextareaF")
let pecas = document.getElementById("floatingTextareaP")
let acessorios = document.getElementById("floatingTextareaA")
let  total = document.getElementById("inputtotalCliente")
let formas = document.getElementById("maintenance-typeD")
let os = document.getElementById('inputNumeroOS')
let dateOS = document.getElementById('inputdataClient')
let idOS = document.getElementById('inputNumeroOS')




function resetForm() {
    location.reload()
    }
    
    api.resetForm((args)=>{
        resetForm()
    })
    
const foco = document.getElementById('inputNameClient')
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    
    

    foco.focus()
})

const input = document.getElementById('inputNameClient')
const suggestionList = document.getElementById('viewListSuggestion')
let idClient = document.getElementById('inputIdClient')
let nameClient = document.getElementById('inputNomeClient')
let phoneClient = document.getElementById('inputtelClient')
let cpfCliente = document.getElementById('inputCPFClient')

let arrayClients = []

input.addEventListener('input',() =>{
    const search = input.value.toLowerCase()
   
    api.searchClients()
    api.listClients((event,clients)=>{
        const dataClients = JSON.parse(clients)
        arrayClients = dataClients
        const result = arrayClients.filter( c=>
            c.nomeClient && c.nomeClient.toLowerCase().includes(search)
        ).slice(0,10)
       
        suggestionList.innerHTML = ""
        result.forEach(c => {
            const item = document.createElement('li')
            item.classList.add('list-group-item','list-group-item-action')
            item.textContent = c.nomeClient 
            suggestionList.appendChild(item)
            item.addEventListener('click',()=>{
                idClient.value = c._id
                nameClient.value = c.nomeClient
                phoneClient.value = c.phoneCliente
                cpfCliente.value = c.cpfCliente
                input.value = ""
                suggestionList.innerHTML = ""
                inputNameClient.disabled = true
            })
        })
    }) 
    document.addEventListener('click',(event) =>{
        if(!input.contains(event.target) && !suggestionList.contains(event.target)){
            suggestionList.innerHTML = ""
        }
    })
})



function inputOS() {
    api.searchOS()
 }
 function excluirOS() {
    
    api.deleteOS(idOS.value)
}

frmOS.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (idClient.value === "") {
        api.validateClient()
    } else {
        if (os.value === "") {
            const os = {
                _id: idOS.value.trim(),
                idClient: idClient.value,
                status: statusOS.value,
                fun: funcioOs.value,
                bike: bikeOs.value,
                numeroQuadro: numS.value,
                cor: cor.value,
                manutencao: manutencao.value,
                previsaoEntrega: previsao.value,
                obsCliente: obsC.value,
                obsFuncionario: obsF.value,
                pecas: pecas.value,
                acessorios: acessorios.value,
                total: total.value,
                formasPagamento: formas.value
            }
            api.newOs(os)
        } else {
                const OSupd = {
                _id: idOS.value.trim(),
                idClient: idClient.value,
                status: statusOS.value,
                fun: funcioOs.value,
                bike: bikeOs.value,
                numeroQuadro: numS.value,
                cor: cor.value,
                manutencao: manutencao.value,
                previsaoEntrega: previsao.value,
                obsCliente: obsC.value,
                obsFuncionario: obsF.value,
                pecas: pecas.value,
                acessorios: acessorios.value,
                total: total.value,
                formasPagamento: formas.value
        }
            api.updateOS(OSupd)
        }
    }
})


function findOS() {
    api.searchOS()
}

api.renderOS((event, dataOS) => {
 
    const os = JSON.parse(dataOS)
    const data = new Date(os.data)
    const formatada = data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })

    idOS.value = os._id
    dateOS.value = formatada
    idClient.value = os.idCliente
    statusOS.value = os.status
    funcioOs.value = os.funcionarioResponsavel
    bikeOs.value = os.bicicleta
    numS.value = os.numeroQuadro
    cor.value = os.corBicicleta
    manutencao.value = os.tipoManutencao
    previsao.value = os.previsaoEntrega
    obsC.value = os.observacaoCliente
    obsF.value = os.conclusaoTecnico
    pecas.value = os.pecasTroca
    acessorios.value = os.acessorios
    total.value = os.total
    formas.value = os.formasPagamento
    console.log("Data recebida:", os.data);
    btnUpdate.disabled = false
    btnDelete.disabled = false
    btnImprimir.disabled = false
    btnCreate.disabled = true
    inputNameClient.disabled = true
    
})

function generateOS(){
    api.printOS()
}