import LightningAlert from "lightning/alert";
import LightningConfirm from "lightning/confirm";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getFieldDisplayValue, getFieldValue } from "lightning/uiRecordApi";

export default class Utils {
	static etErrorsToString(errors) {
		// https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_error
		// Make array if only one.
		if (!Array.isArray(errors)) {
			errors = [errors];
		}
		// Remove null/undefined items
		errors = errors.filter((error) => !!error);
		// Extract an error message
		errors = errors.map((error) => {
			// UI API read errors
			if (Array.isArray(error.body)) {
				return error.body.map((e) => e.message);
			}
			// UI API DML, Apex and network errors
			if (error.body) {
				if (typeof error.body.message === "string") {
					return error.body.message;
					// eslint-disable-next-line no-else-return
				} else {
					try {
						let errorMessage = JSON.stringify(error.body, null, 2);
						if (typeof errorMessage === "string") {
							return errorMessage;
						}
						// if (
						// 	error.body.fieldErrors ||
						// 	(error.body.pageErrors && error.body.pageErrors.length > 0) ||
						// 	error.body.index ||
						// 	(error.body.duplicateResults && error.body.duplicateResults.length > 0)
						// ) {
						// 	let errorMessage = "";
						// 	if (error.body.fieldErrors) {
						// 		if (errorMessage.length > 0) {
						// 			errorMessage += " ";
						// 		}
						// 		errorMessage += "Field errors: ";
						// 		for (const [key, value] of Object.entries(error.body.fieldErrors)) {
						// 			errorMessage += `Field: ${key}. Error(s): `;
						// 			value.forEach((fieldError, index) => {
						// 				if (index > 0) {
						// 					errorMessage += ", ";
						// 				}
						// 				errorMessage += JSON.stringify(fieldError);
						// 			});
						// 		}
						// 	}
						// 	if (error.body.pageErrors && error.body.pageErrors.length > 0) {
						// 		if (errorMessage.length > 0) {
						// 			errorMessage += " ";
						// 		}
						// 		errorMessage += "Page errors: ";
						// 		error.body.pageErrors.forEach((pageError, index) => {
						// 			if (index > 0) {
						// 				errorMessage += ", ";
						// 			}
						// 			errorMessage += JSON.stringify(pageError);
						// 		});
						// 	}
						// 	if (error.body.index) {
						// 		if (errorMessage.length > 0) {
						// 			errorMessage += " ";
						// 		}
						// 		errorMessage += `Index: ${error.body.index}`;
						// 	}
						// 	if (error.body.duplicateResults && error.body.duplicateResults.length > 0) {
						// 		if (errorMessage.length > 0) {
						// 			errorMessage += " ";
						// 		}
						// 		errorMessage += "Duplicate Results: ";
						// 		error.body.duplicateResults.forEach((duplicateResult, index) => {
						// 			if (index > 0) {
						// 				errorMessage += ", ";
						// 			}
						// 			errorMessage += JSON.stringify(duplicateResult);
						// 		});
						// 	}
						// 	return errorMessage;
						// }
					} catch (ex) {
						// Ignore conversion errors
					}
				}
			}
			// JS errors
			else if (typeof error.message === "string") {
				return error.message;
			}
			// Unknown error shape so try HTTP status text
			return error.statusText;
		});
		// Flatten
		errors = errors.reduce((prev, curr) => prev.concat(curr), []);
		// Remove empty strings
		errors = errors.filter((message) => !!message);
		// Make it a string
		errors = errors.join(", ");
		// Replace curly brackets with parenthesis
		errors = errors.replace(/{/g, "(");
		errors = errors.replace(/}/g, ")");
		return errors;
	}

	static msgVariants = {
		error: "error",
		warning: "warning",
		success: "success",
		info: "info"
	};

	static msgModes = {
		sticky: "sticky", // remains visible until you click the close button
		pester: "pester", // remains visible for 3 seconds and disappears automatically. No close button is provided
		dismissible: "dismissible" // Remains visible until you click the close button or 3 seconds has elapsed, whichever comes first
	};

	static questionTypes = {
		TEXT: "Text",
		BOOLEAN: "Boolean",
		SELECT_ONE: "Select One",
		SELECT_TWO: "Select Two",
		SELECT_THREE: "Select Three"
	};

	static logger = {
		log: (...params) => {
			console.log(Utils.logger._source(), ...Utils.logger._cleanLogParams(params));
		},
		error: (...params) => {
			console.error(Utils.logger._source(), ...Utils.logger._cleanLogParams(params));
		},
		_cleanLogParams: (params) => {
			return params.map((param) => {
				try {
					param = JSON.parse(JSON.stringify(param));
				} catch (ex) {
					// Nothing
				}
				return param;
			});
		},
		_source: () => {
			let source;
			const stack = Error().stack.split("\n");
			stack.shift();
			let caller = stack.find((line) => !line.includes("/utils.js:")).trim();
			caller = caller.substring(caller.lastIndexOf("/") + 1);
			caller = caller.substring(0, caller.length - 1);
			source = `(${new Date().toJSON()} *** ${caller})`;
			return source;
		}
	};

	static showNotification(cmp, { title = "", message = "", variant = "success", mode = "dismissible" }) {
		cmp.dispatchEvent(
			new ShowToastEvent({
				title,
				message,
				variant,
				mode
			})
		);
	}

	static reportError(cmp, { error, title = "An Error Has Occurred" }) {
		let msg;
		this.logger.error(error);
		if (typeof error === "string") {
			msg = error;
		} else {
			msg = this.etErrorsToString(error);
		}
		this.logger.error(msg);
		debugger;
		if (cmp) {
			this.showNotification(cmp, { title, message: msg, variant: "error", mode: "sticky" });
		} else {
			throw new Error(msg);
		}
	}

	static async validatePermissionCookies() {
		let useCookies = false;
		try {
			const skipPrompt = true;
			useCookies = await this.getCookie({ key: "ET-UseCookies", skipPrompt });
			if (useCookies) {
				// Good
			} else {
				let userPrompted = await this.getCookie({ key: "ET-UserPrompted", skipPrompt });
				if (!userPrompted) {
					let expirationDTTM = new Date();
					expirationDTTM.setSeconds(expirationDTTM.getSeconds() + 30); // 30 seconds
					await this.setCookie({ key: "ET-UserPrompted", value: true, expirationDTTM, skipPrompt });

					useCookies = await LightningConfirm.open({
						message: "This website uses Cookies and LocalStorage to store data. Do you give permission?",
						variant: "headerless",
						// label value isn't visible in the headerless variant
						label: "Cookies and LocalStorage Permission"
					});

					await this.setCookie({ key: "ET-UseCookies", value: useCookies, skipPrompt });
					if (useCookies) {
						// Do not bother the student for a week
						expirationDTTM.setDate(expirationDTTM.getDate() + 7); // 1 week
						await this.setCookie({ key: "ET-UserPrompted", value: true, expirationDTTM, skipPrompt });
					}
				} else {
					useCookies = false;
				}
			}
		} catch (error) {
			await LightningAlert.open({
				message: "Failed to request user's permission",
				theme: "error", // a red theme intended for error states
				label: "Error!" // this is the header text
			});
		}
		return useCookies;
	}

	static async getCookie({ key, skipPrompt = false }) {
		let output = null;
		if (skipPrompt || (await this.validatePermissionCookies())) {
			document.cookie.split(";").find((cookie) => {
				let isFound = cookie.trim().startsWith(key + "=");
				if (isFound) {
					output = cookie.split("=")[1];
					try {
						output = JSON.parse(output);
					} catch (ex) {
						// Nothing
					}
				}
				return isFound;
			});
		}
		return output;
	}

	static async setCookie({ key, value, expirationDTTM, skipPrompt = false }) {
		if (skipPrompt || (await this.validatePermissionCookies())) {
			let cookie = `${key}=${JSON.stringify(value)}`;
			if (expirationDTTM) {
				cookie = `${cookie}; expires=${expirationDTTM.toUTCString()}; path=/`;
			}
			document.cookie = cookie;
		}
	}

	static async deleteCookie({ key, skipPrompt = false }) {
		if (skipPrompt || (await this.validatePermissionCookies())) {
			document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
		}
	}

	static async getLocalStorage({ key, skipPrompt = false }) {
		let value = null;
		if (skipPrompt || (await this.validatePermissionCookies())) {
			value = localStorage.getItem(key);
			try {
				value = JSON.parse(value);
			} catch (ex) {
				// Nothing
			}
		}
		return value;
	}

	static async setLocalStorage({ key, value, skipPrompt = false }) {
		if (skipPrompt || (await this.validatePermissionCookies())) {
			localStorage.setItem(key, JSON.stringify(value));
		}
	}

	static async deleteLocalStorage({ key, skipPrompt = false }) {
		if (skipPrompt || (await this.validatePermissionCookies())) {
			localStorage.removeItem(key);
		}
	}

	static getField(record, field) {
		return getFieldDisplayValue(record, field) ? getFieldDisplayValue(record, field) : getFieldValue(record, field);
	}

	static removeNamespace({ strData }) {
		// No namespace used here
		// // I am glad, I decided early on to have one central location to access the data and connect to Apex. Otherwise this change would of have been crazy. It touches the entire code!
		// return strData.replaceAll("thstudentengage__", "");
		return strData;
	}

	static addNamespace({ objData }) {
		// No namespace used here
		// const output = {};
		// Object.keys(objData).forEach((key) => {
		// 	const newKey = key.endsWith("__c") ? `thstudentengage__${key}` : key;
		// 	output[newKey] = objData[key];
		// });
		return objData;
	}
}
