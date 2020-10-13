import Axios from 'axios';

const api = Axios.create({
	//baseURL: 'http://localhost:5000/api/'
	baseURL: 'http://158.195.36.37:5000/api/'
});

export default api;