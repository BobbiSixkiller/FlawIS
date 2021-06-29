import { useReducer, useState, useEffect } from "react";
import API from "../api";

function dataFetchReducer(state, action) {
	switch (action.type) {
		case "INIT":
			return { ...state, loading: true, error: false };
		case "SUCCESS":
			return { ...state, loading: false, error: false, data: action.payload };
		case "FAILURE":
			return { ...state, loading: false, error: true, data: action.payload };
		default:
			return { ...state };
	}
}

//dorobit aj state pre METHOD a nasledne vyuzivat aj na posielanie dat POST/PUT/DELETE
export default function useDataFetch(initUrl, initData) {
	const [url, setUrl] = useState(initUrl);
	const [refresh, setRefresh] = useState(false);

	const [state, dispatch] = useReducer(dataFetchReducer, {
		loading: false,
		error: false,
		data: initData,
	});

	useEffect(() => {
		let cancel = false;

		async function fetchData() {
			dispatch({ type: "INIT" });

			try {
				const res = await API.get(url);
				if (!cancel) {
					dispatch({ type: "SUCCESS", payload: res.data });
				}
			} catch (err) {
				if (!cancel) {
					dispatch({ type: "FAILURE", payload: err.response.data });
				}
			}
		}

		fetchData();
		return () => (cancel = true);
	}, [url, refresh]);

	function refreshData() {
		setRefresh(!refresh);
	}

	return { state, setUrl, refreshData };
}
