const environment = [
    'https://api.adidas-116.com',
    'http://localhost:5581',
]
const currentEnvironment = environment[0]

export const endPoint = {
    auth: `${currentEnvironment}/auth`,
    users: `${currentEnvironment}/users`,
    areas: `${currentEnvironment}/areas`,
    externalAccount: `${currentEnvironment}/external-account`,
    meetings: `${currentEnvironment}/meetings`,
    markets: `${currentEnvironment}/markets`,
}