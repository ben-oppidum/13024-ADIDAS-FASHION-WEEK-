// Axios Header
export function axiosHeader(contentType:string = 'application/json') {
    const token = localStorage.getItem('token')
    return {
        headers: { 
            'Content-Type': contentType,
            'Accept': 'application/json',
            'x-auth-token': token
        }
    }
}