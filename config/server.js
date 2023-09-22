import ENV_VARS from "../envConfig.js"
const serverConfig = (server) => {
    const startServer = () => { 
        server.listen(ENV_VARS.PORT, () => {
            console.log(`Server listening on Port ${ENV_VARS.PORT}`)
        })
    }
    return {
        startServer
    }
}

export default serverConfig