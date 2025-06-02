const { connect } = require('http2')
const mongoose = require('mongoose')

const url = 'mongodb://localhost:27017/'

let conectado = false

const conectar = async () => {
    if (!conectado){
        try{
            await mongoose.connect(url)
            conectado=true
            return true
        }catch (error){
            if (error.code = 8000){
                
            }else{
               console.log(error)
            }
        }
    }
}

const desconectar = async () => {
    if (conectado){
        try{
            await mongoose.disconnect(url)
            conectado=false

        }catch (error){
            console.log(error)
        }
    }
}

module.exports = {conectar,desconectar}