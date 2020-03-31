export class config {
    // Dev 
    // env = {
    //     socket_api_url: 'wss://socketapi.instadispatch.com:3001',
    //     driver_socket_api_url: 'wss://gps.app-tree.co.uk:3500',
    //     name: 'dev',
    //     company_id: localStorage.getItem('company'),
    //     user_id: localStorage.getItem('user_id'),
    //     wairehouse_id: localStorage.getItem('warehouse_id'),
    //     email: localStorage.getItem('primary_email'),
    //     profileImage: localStorage.getItem('profile_image'),
    //     user_level: localStorage.getItem('user_level'),
    //     google_api_key: 'AIzaSyD-X5xWDTa9L15dUYkWUjRExGRHznOfFsQ',
    //     mapbox_api_key:'pk.eyJ1IjoiaW5zdGFkaXNwYXRjaCIsImEiOiJjazJvajJueWwwNjlmM2dwcHMxbTFiMHl0In0.9eyVqMCN3WIodGdslgQ1hA',
    //     icargo_access_token :localStorage.getItem('access_token'),
    //     icargo_api_url:'https://api.instadispatch.com/app-allignment/parcel-api/v1/',
    //     socket_rest_api_url: 'https://socketapi.instadispatch.com:3001/',
    //     icargo_url:'https://www.idtest.uk/',
    //     country_code:localStorage.getItem('country_code')
    // }
    //Live
    env = {
        socket_api_url: 'wss://socketapi.instadispatch.com:3002',
        driver_socket_api_url: 'wss://gps.app-tree.co.uk:3000',
        name: 'live',
        company_id: localStorage.getItem('company'),
        user_id: localStorage.getItem('user_id'),
        wairehouse_id: localStorage.getItem('warehouse_id'),
        email: localStorage.getItem('primary_email'),
        profileImage: localStorage.getItem('profile_image'),
        user_level: localStorage.getItem('user_level'),
        google_api_key: 'AIzaSyD-X5xWDTa9L15dUYkWUjRExGRHznOfFsQ',
        mapbox_api_key:'pk.eyJ1IjoiaW5zdGFkaXNwYXRjaCIsImEiOiJjazJvajJueWwwNjlmM2dwcHMxbTFiMHl0In0.9eyVqMCN3WIodGdslgQ1hA',
        icargo_access_token :localStorage.getItem('access_token'),
        icargo_api_url:'https://api.instadispatch.com/live/v1/',
        socket_rest_api_url: 'https://socketapi.instadispatch.com:3002/',
        icargo_url:'https://route.instadispatch.com',
        country_code:localStorage.getItem('country_code')
    }

    //Local
    // env = {
    //     name: 'local',
    //     socket_api_url: 'http://localhost:3000/',
    //     driver_socket_api_url: 'wss://gps.app-tree.co.uk:3500',
    //     company_id: 10,
    //     user_id: 10,
    //     wairehouse_id: 1,
    //     email: '5ways@gmail.com',
    //     profileImage: 'https://icargo-public.s3.eu-west-1.amazonaws.com/dev/images/company/profile/5cac6a1a74daf-5cac6a1a74df1-images.png',
    //     user_level: 2,
    //     google_api_key: 'AIzaSyD-X5xWDTa9L15dUYkWUjRExGRHznOfFsQ',
    //     mapbox_api_key: 'pk.eyJ1IjoiaW5zdGFkaXNwYXRjaCIsImEiOiJjazJvajJueWwwNjlmM2dwcHMxbTFiMHl0In0.9eyVqMCN3WIodGdslgQ1hA',
    //     icargo_access_token: 'MTQ1NTYyMTUxMC01ZTZjYzhlZjc5NTE3LTEw',
    //     icargo_api_url: 'http://localhost/parcel-api/v1/',
    //     socket_rest_api_url: 'http://localhost:3000/',
    //     icargo_url:'http://localhost/icargo',
    //     country_code:'GB'
    // }
}