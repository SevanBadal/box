export const errorHandler = (error) => {
    if (error) {
        if (error.code == 'PGRST301') {
            console.log("This command failed because your session expired.\nPlease login to begin a new session\n`box --help` for details ")
        }
        process.exit(1)
    }
}