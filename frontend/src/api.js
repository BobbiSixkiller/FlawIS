import Axios from "axios";

const api = Axios.create({
	baseURL: "http://flawis-backend.flaw.uniba.sk/",
});

export default api;
