import Axios from "axios";

const api = Axios.create({
	baseURL: "localhost:5000/api/",
});

export default api;
