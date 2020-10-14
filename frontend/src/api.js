import Axios from 'axios';

const api = Axios.create({
	//baseURL: 'http://localhost:5000/api/'
	baseURL: 'http://flawis-backend.flaw.uniba.sk/api/'
});

export default api;