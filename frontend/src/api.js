import Axios from "axios";

const api = Axios.create({
<<<<<<< HEAD
	baseURL: 'https://flawis-backend.flaw.uniba.sk/api/'
=======
	baseURL: "http://localhost:5000/api/",
>>>>>>> dev
});

export default api;
