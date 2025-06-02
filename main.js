const { app, BrowserWindow, nativeTheme, Menu,ipcMain, dialog, shell} = require('electron')
const {conectar, desconectar} = require('./db.js')
const clientModel = require('./src/models/Cliente.js')
const osModel = require ("./src/models/OS.js")
const  {jspdf, default: jsPDF} = require('jspdf')
const fs = require('fs')
const prompt = require ('electron-prompt')
const mongoose = require('mongoose')
const { Types } = require('mongoose')

const path = require('node:path')
let win

const createWindow = () => {
   nativeTheme.themeSource ='dark'
   win = new BrowserWindow({
    width: 1010,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname,'preload.js')
    }
   
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  
  win.loadFile('./src/views/index.html')
  
  ipcMain.on('client-window', () => {
    clientWindow ()
  })
   
   ipcMain.on('os-window', () => {
    osWindow ()
  })
}

function aboutWindow(){
  nativeTheme.themeSource = 'dark'
  const main = BrowserWindow.getFocusedWindow()
  let about
  if (main) {
    about =  new BrowserWindow({
      width: 360,
      height:200,
      autoHideMenuBar: true,
      resizable: false,
      minimizable:false,
      modal: true,
      parent:main
    })
  }
  about.loadFile('./src/views/sobre.html')
}


let client
function clientWindow() {
  nativeTheme.themeSource = 'dark'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client =  new BrowserWindow({
      width: 1010,
      height:720,
      resizable: false,
      modal:true,
      webPreferences: {
        preload: path.join(__dirname,'preload.js')
      },
      minimizable:false,
      parent:main
    })

}
client.loadFile('./src/views/cliente.html')
client.center()
}

let os
function osWindow() {
  nativeTheme.themeSource = 'dark'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    os =  new BrowserWindow({
      width: 1010,
      height:720,
      resizable: false,
      modal:true,
      minimizable:false,
      parent:main,
      webPreferences: {
        preload: path.join(__dirname,'preload.js')
      },
    })

}
os.loadFile('./src/views/os.html')
os.center()
}

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
      }
    })
  })
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.commandLine.appendSwitch('log-level','3')

ipcMain.on('db-connect', async (event)=>{
  let conectado = await conectar()
  if (conectado){
    setTimeout(()=>{
      event.reply('db-status',"conectado")
    }, 500)
  }
})



app.on('before-quit', ()=>{
 desconectar()
})

  
const  template = [
  {
     label: 'Cadastro',
     submenu: [{label: 'Clientes', click: () => clientWindow ()},{label:'OS', click: () => osWindow ()},{type:'separator'},{label:'Sair', click: () => app.quit(), accelerator:'Alt+F4'}]
  },
  {
      label: 'Relatorios',
      submenu: [{label: 'Clientes',click: () => relatorioClientes()},{type: 'separator'},{label:'OS abertas', click: () => relatorioOS()},{label:'OS concluidas',click: () => relatorioOSconcluida()}]
  },
  {
      label: 'Ferramentas',
      submenu: [{label: 'Aplicar Zoom', role: 'zoomIn'},{label: 'Reduzir', role: 'zoomOut'},{ label: 'Restaurar o Zoom', role: 'resetZoom'}]
  },
  {
      label: 'Ajuda',
      submenu: [{label:'Sobre',click: () => aboutWindow()}]
  }
]


ipcMain.on('new-client', async (event,client)=>{
  try {
    const newClient = new clientModel({
      nomeClient: client.nameCli,
      cpfCliente: client.cpfCli,
      emailCliente: client.emailCli,
      phoneCliente: client.phoneCli,
      cepCliente: client.cepCli,
      addressCliente: client.addressCli,
      numberCliente: client.numberCli,
      complementCliente: client.complementCli,
      bairroCliente: client.bairroCli,
      cityCliente: client.cityCli,
      ufCliente: client.ufCli    })
      await newClient.save()
      dialog.showMessageBox({
        type: 'info',
        title: "Aviso",
        message: "Cliente adicionado com sucesso",
        buttons: ['OK']
      }).then((result)=>{
        if(result.response === 0){
         event.reply('reset-form') 
        }
         
      })
  } catch (error) {
       
       if(error.code === 11000) {
        dialog.showMessageBox({
            type: 'error',
            title: "Atenção!",
            message: "CPF já está cadastrado\nVerifique se digitou corretamente",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                
            }
        })
    }
    console.log(error)
  }
})


async function relatorioClientes() {
  try {
      const clientes = await clientModel.find().sort({nomeClient:1})
     const doc = new jsPDF('p','mm','a4')
     const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
     const imageBase64 = fs.readFileSync(imagePath, {encoding: 'base64'})
     doc.addImage(imageBase64, 'PNG', -3,-23)
     doc.setFontSize(18)
     doc.text("Relatorio de clientes", 14, 45)
     const dataAtual = new Date().toLocaleDateString('pt-br')
     doc.setFontSize(12)
     doc.text(`Data: ${dataAtual}`, 170,10)
     let y = 60
     doc.text("Nome", 14,y)
     doc.text("telefone", 80,y)
     doc.text("email", 130,y)
     y+= 5
     doc.setLineWidth(0.5)
     doc.line(10,y,200,y)
    
     y+= 10
     clientes.forEach((c)=>{
      if (y > 280){
        doc.addPage()
        y = 20
        doc.text("Nome", 14,y)
        doc.text("telefone", 80,y)
        doc.text("email", 130,y)
        y+= 5
        doc.setLineWidth(0.5)
        doc.line(10,y,200,y)
        y+=10       
      }
      doc.text(c.nomeClient,14,y)
      doc.text(c.phoneCliente,80,y)
      doc.text(c.emailCliente || "N/A",130,y)
      y+=10

     })
     const paginas = doc.internal.getNumberOfPages ()
     for (let i = 1; i <= paginas; i++){
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Pagina ${i} de ${paginas}`, 105, 290, {align: 'center'})
     }
     const tempDir = app.getPath('temp')
     const filePath = path.join(tempDir, 'clientes.pdf')
     doc.save(filePath)
     shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}


async function relatorioOS() {
  try {
    const clientes = await osModel.find({ status: 'aberta' }).sort({ previsaoEntrega: 1 })
     const doc = new jsPDF('p','mm','a4')
     const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
     const imageBase64 = fs.readFileSync(imagePath, {encoding: 'base64'})
     doc.addImage(imageBase64, 'PNG', -3,-23)
     doc.setFontSize(18)
     doc.text("Relatorio de OS Abertas", 14, 45)
     const dataAtual = new Date().toLocaleDateString('pt-br')
     doc.setFontSize(12)
     doc.text(`Data: ${dataAtual}`, 170,10)
     let y = 60
     doc.text("Funcionario", 14,y)
     doc.text("Numero de identificação", 60,y)
     doc.text("Tipo", 125,y)
     doc.text("Previsão de entrega", 160,y)
     y+= 5
     doc.setLineWidth(0.5)
     doc.line(10,y,200,y)
    
     y+= 10
     clientes.forEach((c)=>{
      if (y > 280){
        doc.addPage()
        y = 20
        doc.text("Funcionario", 14,y)
        doc.text("Numero de identificação", 60,y) 
        doc.text("Tipo", 125,y)
        doc.text("Previsão de entrega", 160,y)
        y+= 5
        doc.setLineWidth(0.5)
        doc.line(10,y,200,y)
        y+=10       
      }
      doc.text(c.funcionarioResponsavel,14,y)
      doc.text(c.numeroQuadro|| "N/A",60,y)
      doc.text(c.tipoManutencao || "N/A",115,y)
      doc.text(c.previsaoEntrega || "N/A",160,y)
      y+=10

     })
     const paginas = doc.internal.getNumberOfPages ()
     for (let i = 1; i <= paginas; i++){
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Pagina ${i} de ${paginas}`, 105, 290, {align: 'center'})
     }
     const tempDir = app.getPath('temp')
     const filePath = path.join(tempDir, 'OS.pdf')
     doc.save(filePath)
     shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}
async function relatorioOSconcluida() {
  try {
    const clientes = await osModel.find({ status: 'Concluida' }).sort({ previsaoEntrega: 1 })
     const doc = new jsPDF('p','mm','a4')
     const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
     const imageBase64 = fs.readFileSync(imagePath, {encoding: 'base64'})
     doc.addImage(imageBase64, 'PNG', -3,-23)
     doc.setFontSize(18)
     doc.text("Relatorio de OS Concluidas", 14, 45)
     const dataAtual = new Date().toLocaleDateString('pt-br')
     doc.setFontSize(12)
     doc.text(`Data: ${dataAtual}`, 170,10)
     let y = 60
     doc.text("Funcionario", 14,y)
     doc.text("Formas de pagamento", 65,y)
     doc.text("R$", 115,y)
     doc.text("Tipo de manutenção", 160,y)
     y+= 5
     doc.setLineWidth(0.5)
     doc.line(10,y,200,y)
    
     y+= 10
     clientes.forEach((c)=>{
      if (y > 280){
        doc.addPage()
        y = 20
        doc.text("Funcionario", 14,y)
        doc.text("Formas de pagamento", 65,y) 
        doc.text("R$", 115,y)
        doc.text("Tipo de manutenção", 160,y)
        y+= 5
        doc.setLineWidth(0.5)
        doc.line(10,y,200,y)
        y+=10       
      }
      doc.text(c.funcionarioResponsavel,14,y)
      doc.text(c.formasPagamento|| "N/A",70,y)
      doc.text(`${c.total ?? 'N/A'}`, 115, y)
      doc.text(c.tipoManutencao || "N/A",160,y)
      y+=10

     })
     const paginas = doc.internal.getNumberOfPages ()
     for (let i = 1; i <= paginas; i++){
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Pagina ${i} de ${paginas}`, 105, 290, {align: 'center'})
     }
     const tempDir = app.getPath('temp')
     const filePath = path.join(tempDir, 'OS.pdf')
     doc.save(filePath)
     shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

ipcMain.on('validate-search', ()=>{
  dialog.showMessageBox({
    type: 'warning',
    title: 'Atenção!',
    message: 'Preencha o campo de busca',
    buttons: ['OK']

  })
})
ipcMain.on('search-name', async(event,name)=>{
  try {
    
    
    
    const dataClient  = await clientModel.find({
      $or: [
        { nomeClient: new RegExp(name, 'i') },
        { cpfCliente: new RegExp(name, 'i') }
      ]
    })
    if (dataClient.length === 0) {
      dialog.showMessageBox({
        type: "warning",
        title: "aviso",
        message: "Cliente não cadastrado, deseja cadastrar?",
        defaultId: 0,
        buttons: ['Sim', 'Não']

      }).then((result) =>{
        if (result.response===0) {
          event.reply('set-client')
        } else {
          event.reply('reset-form')
        }
      })
    } 
    
    event.reply ('render-client', JSON.stringify(dataClient))
    
  } catch (error) {
    console.log(error)  }
})
ipcMain.on('validate-client', (event) => {
  dialog.showMessageBox({
      type: 'warning',
      title: "Aviso!",
      message: "É obrigatório vincular o cliente na Ordem de Serviço",
      buttons: ['OK']
  }).then((result) => {
      
      if (result.response === 0) {
          event.reply('set-search')
      }
  })
})


ipcMain.on('new-os', async (event, os) => {
  try {
    const newOs = new osModel({
      idCliente: os.idClient,
      status: os.status,
      funcionarioResponsavel: os.fun,
      bicicleta: os.bike,
      numeroQuadro: os.numeroQuadro,
      corBicicleta: os.cor,
      tipoManutencao: os.manutencao,
      previsaoEntrega: os.previsaoEntrega,
      observacaoCliente: os.obsCliente,
      conclusaoTecnico: os.obsFuncionario,
      pecasTroca: os.pecas,
      acessorios: os.acessorios,
      total: os.total,
      formasPagamento: os.formasPagamento
    })

    await newOs.save()

    const result = await dialog.showMessageBox({
      type: 'question',
      title: "OS adicionada com sucesso",
      message: "Deseja imprimir a Ordem de Serviço agora?",
      buttons: ['Sim', 'Não'],
      defaultId: 0, 
      cancelId: 1   
    })

    if (result.response === 0) {
      
      imprimirOS(newOs._id)
    }

    event.reply('reset-form') 
  } catch (error) {
    console.error("Erro ao criar nova OS:", error)
  }
})

ipcMain.on('search-os', (event) =>{
  
  prompt({
    title: 'Buscar OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
        type: 'text'
    },
    type: 'input',        
    width: 400,
    height: 200
}).then(async(result) => {
    if (result !== null) {
        
        
        if (mongoose.Types.ObjectId.isValid(result)) {
          try {
              const dataOS = await osModel.findById(result)
              if (dataOS) {
                  
                  
                  
                  event.reply('render-os', JSON.stringify(dataOS))
              } else {
                  dialog.showMessageBox({
                      type: 'warning',
                      title: "Aviso!",
                      message: "OS não encontrada",
                      buttons: ['OK']
                  })
              }
          } catch (error) {
              console.log(error)
          }
      } else {
          dialog.showMessageBox({
              type: 'error',
              title: "Atenção!",
              message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
              buttons: ['OK']
          })
      }
    } 
})
})


ipcMain.on('search-clients', async (event)=>{
  try {
    const clients = await clientModel.find().sort({ nomeClient: 1})
    event.reply('list-clients', JSON.stringify(clients))
  } catch (error) {
    console.log(error)
  }
})


ipcMain.on('delete-client',async(event, id)=> {
 
  try {
    const {response } = await dialog.showMessageBox(client,{
      type: 'warning',
      title: "Atenção",
      message: "DESEJA EXCLUIR ESTE CLIENTE REALMENTE?",
      buttons: ['Cancelar','Excluir']
    })
    if (response === 1){
      const delClient = await clientModel.findByIdAndDelete(id)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)
  }
})
ipcMain.on('delete-OS',async(event, id)=> {
 
  try {
    const {response } = await dialog.showMessageBox(os,{
      type: 'warning',
      title: "Atenção",
      message: "DESEJA EXCLUIR ESTA OS REALMENTE?",
      buttons: ['Cancelar','Excluir']
    })
    if (response === 1){
      const delos = await osModel.findByIdAndDelete(id)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)
  }
})

 
ipcMain.on('update-client', async (event, client) => {
  

  try {
      
      
      
      const updateClient = await clientModel.findByIdAndUpdate(
          client.idCli,
          {
              nomeClient: client.nameCli,
              cpfCliente: client.cpfCli,
              emailCliente: client.emailCli,
              phoneCliente: client.phoneCli,
              cepCliente: client.cepCli,
              addressCliente: client.addressCli,
              numberCliente: client.numberCli,
              complementCliente: client.complementCli,
              bairroCliente: client.bairroCli,
              cityCliente: client.cityCli,
              ufCliente: client.ufCli
          },
          {
              new: true
          }
      )

      
      dialog.showMessageBox({
          
          type: 'info',
          title: "Aviso",
          message: "Dados do cliente alterados com sucesso",
          buttons: ['OK']
      }).then((result) => {
          
          if (result.response === 0) {
              
              event.reply('reset-form')
          }
      });
  } catch (error) {
      console.log(error)
  }
})
ipcMain.on('update-OS', async (event, OSupd) => {

  try {
    
    const idConvertido = new Types.ObjectId(OSupd._id.trim())

    
    const docTest = await osModel.findById(idConvertido)
    

    if (!docTest) {
      dialog.showErrorBox("Erro", "Documento com esse ID não encontrado.")
      return
    }

    
    const updateOS = await osModel.findByIdAndUpdate(
      idConvertido,
      {
        status: OSupd.status,
        funcionarioResponsavel: OSupd.fun,
        bicicleta: OSupd.bike,
        numeroQuadro: OSupd.numeroQuadro,
        corBicicleta: OSupd.cor,
        tipoManutencao: OSupd.manutencao,
        previsaoEntrega: OSupd.previsaoEntrega,
        observacaoCliente: OSupd.obsCliente,
        conclusaoTecnico: OSupd.obsFuncionario,
        pecasTroca: OSupd.pecas,
        acessorios: OSupd.acessorios,
        total: OSupd.total,
        formasPagamento: OSupd.formasPagamento
      },
      { new: true }
    )


    if (!updateOS) {
      dialog.showErrorBox("Erro", "Erro ao atualizar OS (update nulo).")
      return
    }

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Dados da OS alterados com sucesso",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })

  } catch (error) {
    console.error("❌ Erro ao atualizar OS:", error)
    dialog.showErrorBox("Erro inesperado", "Erro ao atualizar OS. Veja o console.")
  }
})



ipcMain.on('print-os', (event) =>{

  prompt({
    title: 'Imprimir OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
        type: 'text'
    },
    type: 'input',        
    width: 400,
    height: 200
}).then(async(result) => {
    if (result !== null) {
        
        
        if (mongoose.Types.ObjectId.isValid(result)) {
          try {
            const dataOS = await osModel.findById(result)
            if (dataOS && dataOS !== null) {
                const dataClient  = await clientModel.find({ _id: dataOS.idCliente}) 
                

const doc = new jsPDF('p', 'mm', 'a4')


const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
doc.addImage(imageBase64, 'PNG', 5, -23, 80, 80) 


doc.setFontSize(18)
doc.text(`Ordem de Serviço - ${dataOS._id}`, 14, 40) 


doc.setFontSize(12)
let y = 50


const client = dataClient[0] || {}

doc.text("Dados do Cliente:", 14, y)
y += 6
doc.text(`Nome: ${client.nomeClient || ''}`, 14, y)
y += 6
doc.text(`CPF: ${client.cpfCliente || ''}`, 14, y)
y += 6
doc.text(`Email: ${client.emailCliente || ''}`, 14, y)
y += 6
doc.text(`Telefone: ${client.phoneCliente || ''}`, 14, y)
y += 6
doc.text(`Endereço: ${client.addressCliente || ''}, Nº ${client.numberCliente || ''} ${client.complementCliente || ''}`, 14, y)
y += 6
doc.text(`Bairro: ${client.bairroCliente || ''}`, 14, y)
y += 6
doc.text(`Cidade/UF: ${client.cityCliente || ''} - ${client.ufCliente || ''}`, 14, y)
y += 10


doc.text("Informações da Ordem de Serviço:", 14, y)
y += 6
doc.text(`Status: ${dataOS.status}`, 14, y)
y += 6
doc.text(`Funcionário Responsável: ${dataOS.funcionarioResponsavel}`, 14, y)
y += 6
doc.text(`Bicicleta: ${dataOS.bicicleta}`, 14, y)
y += 6
doc.text(`Número do Quadro: ${dataOS.numeroQuadro}`, 14, y)
y += 6
doc.text(`Cor: ${dataOS.corBicicleta}`, 14, y)
y += 6
doc.text(`Tipo de Manutenção: ${dataOS.tipoManutencao}`, 14, y)
y += 6
doc.text(`Previsão de Entrega: ${dataOS.previsaoEntrega}`, 14, y)
y += 6
doc.text(`Observação do Cliente: ${dataOS.observacaoCliente}`, 14, y)
y += 6
doc.text(`Conclusão Técnica: ${dataOS.conclusaoTecnico}`, 14, y)
y += 6
doc.text(`Peças Trocadas: ${dataOS.pecasTroca}`, 14, y)
y += 6
doc.text(`Acessórios: ${dataOS.acessorios}`, 14, y)
y += 6
doc.text(`Forma de Pagamento: ${dataOS.formasPagamento}`, 14, y)
y += 6
doc.text(`Total: R$ ${dataOS.total.toFixed(2)}`, 14, y)
y += 10


doc.setFontSize(12)
const termo = `
Termo de Serviço e Garantia

O cliente autoriza a realização dos serviços descritos nesta ordem, ciente e de acordo com as seguintes condições:

- O diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso o cliente opte por não realizá-lo, poderá ser cobrada taxa referente à avaliação técnica.
- Peças substituídas podem ser devolvidas ao cliente, mediante solicitação no ato do serviço. Caso contrário, serão descartadas de forma apropriada.
- A garantia dos serviços prestados é de 90 dias, conforme o Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente os reparos executados e peças trocadas, desde que a bicicleta não tenha sido alterada ou reparada por terceiros após o serviço.
- Não nos responsabilizamos por objetos ou acessórios deixados na bicicleta que não tenham sido informados previamente.
- Bicicletas não retiradas em até 90 dias após a conclusão do serviço poderão ser cobradas por taxa de armazenagem ou encaminhadas para descarte, conforme o Art. 1.275 do Código Civil.

O cliente declara estar ciente e de acordo com os termos acima.`

doc.text(termo, 14, y, { maxWidth: 180 })


y += 100


doc.setFontSize(12)
doc.text("_________________________________________", 14, y)
doc.text("Assinatura do Cliente", 14, y + 6)


doc.text("_________________________________________", 120, y)
doc.text("Data de Retirada", 120, y + 6)



const tempDir = app.getPath('temp')
const filePath = path.join(tempDir, 'os.pdf')
doc.save(filePath)
shell.openPath(filePath)

                
            } else {
                dialog.showMessageBox({
                    type: 'warning',
                    title: "Aviso!",
                    message: "OS não encontrada",
                    buttons: ['OK']
                })
            }
          } catch (error) {
              console.log(error)
          }
      } else {
          dialog.showMessageBox({
              type: 'error',
              title: "Atenção!",
              message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
              buttons: ['OK']
          })
      }
    } 
})
})
const imprimirOS = async (osId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(osId)) {
      return dialog.showMessageBox({
        type: 'error',
        title: "Erro",
        message: "ID de OS inválido para impressão.",
        buttons: ['OK']
      })
    }

    const dataOS = await osModel.findById(osId)
    if (!dataOS) {
      return dialog.showMessageBox({
        type: 'warning',
        title: "Aviso!",
        message: "OS não encontrada.",
        buttons: ['OK']
      })
    }

    const dataClient = await clientModel.find({ _id: dataOS.idCliente })

    
    const doc = new jsPDF('p', 'mm', 'a4')
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 5, -23, 80, 80)

    doc.setFontSize(18)
    doc.text(`Ordem de Serviço - ${dataOS._id}`, 14, 40)

    doc.setFontSize(12)
    let y = 50

    const client = dataClient[0] || {}
    doc.text("Dados do Cliente:", 14, y)
    y += 6
    doc.text(`Nome: ${client.nomeClient || ''}`, 14, y)
    y += 6
    doc.text(`CPF: ${client.cpfCliente || ''}`, 14, y)
    y += 6
    doc.text(`Email: ${client.emailCliente || ''}`, 14, y)
    y += 6
    doc.text(`Telefone: ${client.phoneCliente || ''}`, 14, y)
    y += 6
    doc.text(`Endereço: ${client.addressCliente || ''}, Nº ${client.numberCliente || ''} ${client.complementCliente || ''}`, 14, y)
    y += 6
    doc.text(`Bairro: ${client.bairroCliente || ''}`, 14, y)
    y += 6
    doc.text(`Cidade/UF: ${client.cityCliente || ''} - ${client.ufCliente || ''}`, 14, y)
    y += 10

    doc.text("Informações da Ordem de Serviço:", 14, y)
    y += 6
    doc.text(`Status: ${dataOS.status}`, 14, y)
    y += 6
    doc.text(`Funcionário Responsável: ${dataOS.funcionarioResponsavel}`, 14, y)
    y += 6
    doc.text(`Bicicleta: ${dataOS.bicicleta}`, 14, y)
    y += 6
    doc.text(`Número do Quadro: ${dataOS.numeroQuadro}`, 14, y)
    y += 6
    doc.text(`Cor: ${dataOS.corBicicleta}`, 14, y)
    y += 6
    doc.text(`Tipo de Manutenção: ${dataOS.tipoManutencao}`, 14, y)
    y += 6
    doc.text(`Previsão de Entrega: ${dataOS.previsaoEntrega}`, 14, y)
    y += 6
    doc.text(`Observação do Cliente: ${dataOS.observacaoCliente}`, 14, y)
    y += 6
    doc.text(`Conclusão Técnica: ${dataOS.conclusaoTecnico}`, 14, y)
    y += 6
    doc.text(`Peças Trocadas: ${dataOS.pecasTroca}`, 14, y)
    y += 6
    doc.text(`Acessórios: ${dataOS.acessorios}`, 14, y)
    y += 6
    doc.text(`Forma de Pagamento: ${dataOS.formasPagamento}`, 14, y)
    y += 6
    doc.text(`Total: R$ ${dataOS.total.toFixed(2)}`, 14, y)
    y += 10

    doc.setFontSize(12)
    const termo = `
Termo de Serviço e Garantia

O cliente autoriza a realização dos serviços descritos nesta ordem, ciente e de acordo com as seguintes condições:

- O diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso o cliente opte por não realizá-lo, poderá ser cobrada taxa referente à avaliação técnica.
- Peças substituídas podem ser devolvidas ao cliente, mediante solicitação no ato do serviço. Caso contrário, serão descartadas de forma apropriada.
- A garantia dos serviços prestados é de 90 dias, conforme o Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente os reparos executados e peças trocadas, desde que a bicicleta não tenha sido alterada ou reparada por terceiros após o serviço.
- Não nos responsabilizamos por objetos ou acessórios deixados na bicicleta que não tenham sido informados previamente.
- Bicicletas não retiradas em até 90 dias após a conclusão do serviço poderão ser cobradas por taxa de armazenagem ou encaminhadas para descarte, conforme o Art. 1.275 do Código Civil.

O cliente declara estar ciente e de acordo com os termos acima.`
    doc.text(termo, 14, y, { maxWidth: 180 })
    y += 100

    doc.text("_________________________________________", 14, y)
    doc.text("Assinatura do Cliente", 14, y + 6)
    doc.text("_________________________________________", 120, y)
    doc.text("Data de Retirada", 120, y + 6)

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'os.pdf')
    doc.save(filePath)
    shell.openPath(filePath)

  } catch (error) {
    console.error("Erro ao imprimir OS:", error)
  }
}


ipcMain.on('show-error-box', (event, message) => {
  dialog.showMessageBox({
    type: 'error',
    title: 'Erro',
    message: message,
    buttons: ['OK']
  });
});