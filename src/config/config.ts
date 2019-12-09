export class config {
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
    //     icargo_api_url:'https://api.instadispatch.com/dev/v1/'
    // }
//Live
    // env = {
    //     socket_api_url: 'wss://socketapi.instadispatch.com:3001',
    //     driver_socket_api_url: 'wss://gps.app-tree.co.uk:3500',
    //     name: 'live',
    //     company_id: localStorage.getItem('company'),
    //     user_id: localStorage.getItem('user_id'),
    //     wairehouse_id: localStorage.getItem('warehouse_id'),
    //     email: localStorage.getItem('primary_email'),
    //     profileImage: localStorage.getItem('profile_image'),
    //     user_level: localStorage.getItem('user_level'),
    //     google_api_key: 'AIzaSyD-X5xWDTa9L15dUYkWUjRExGRHznOfFsQ',
    //     mapbox_api_key:'pk.eyJ1IjoiaW5zdGFkaXNwYXRjaCIsImEiOiJjazJvajJueWwwNjlmM2dwcHMxbTFiMHl0In0.9eyVqMCN3WIodGdslgQ1hA',
    //     icargo_access_token :localStorage.getItem('access_token'),
    //     icargo_api_url:'https://api.instadispatch.com/live/v1/'
    // }

    //Local
    env = {
        name: 'local',
        socket_api_url: 'http://localhost:3000/',
        driver_socket_api_url: 'wss://gps.app-tree.co.uk:3000',
        company_id: 10,
        user_id: 10,
        wairehouse_id: 1,
        email: '5ways@gmail.com',
        profileImage: 'https://icargo-public.s3.eu-west-1.amazonaws.com/dev/images/company/profile/5cac6a1a74daf-5cac6a1a74df1-images.png',
        user_level: 2,
        google_api_key:'AIzaSyD-X5xWDTa9L15dUYkWUjRExGRHznOfFsQ',
        mapbox_api_key:'pk.eyJ1IjoiaW5zdGFkaXNwYXRjaCIsImEiOiJjazJvajJueWwwNjlmM2dwcHMxbTFiMHl0In0.9eyVqMCN3WIodGdslgQ1hA',
        icargo_access_token : 'MTgwNDk4MDg4LTVkZDNjZWEwNzU2ZjAtMTA=',
        icargo_api_url:'http://localhost/parcel-api/v1/'
    }
}