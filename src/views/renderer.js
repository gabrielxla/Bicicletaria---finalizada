
console.log("processo de renderição")

function cliente(){
    
    api.clientWindow ()
}
function os(){
    api.osWindow ()
}


api.dbStatus((event,message)=>{
    console.log(message)
    if(message === "conectado"){
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    }
})