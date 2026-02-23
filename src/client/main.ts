import { sendMessage } from "./network.js";

console.log('Iniciando');

export const form = document.getElementById("form") as HTMLFormElement;
export const input = document.getElementById("input") as HTMLInputElement;
export const messages = document.getElementById("messages") as HTMLUListElement;

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if(input.value) {
        sendMessage(input.value);
        input.value = "";
    }
});