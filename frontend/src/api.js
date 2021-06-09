import Axios from "axios";

const api = Axios.create({
	baseURL: "https://flawis-backend.flaw.uniba.sk:5000/",
});

export default api;
