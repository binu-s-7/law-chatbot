// export async function post(req, res) {
//     try {
//         // Your API logic here
//         const data = { message: "This is a response from a POST request." };
//         res.status(200).json(data);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


export async function POST(request: Request, response: Response) {
    try {
        console.log("sending data")
        // Perform the API call
        // const { searchParams } = new URL(request.body)
        // const text = await request.fromData()
        // console.log(text)
        const res_1 = await request.text()
        console.log(res_1)  // {"prompt":"Batman"}
        const prompt = JSON.parse(res_1).title
        console.log(prompt)


        const body = {
            model: "fooocus",
            input: {
                prompt: decodeURIComponent(prompt || ""),
                // prompt: "",
                negative_prompt: "",
                style_selections: [
                    "Fooocus V2",
                    "Fooocus Enhance",
                    "Fooocus Sharp"
                ],
                performance_selection: "Speed",
                aspect_ratios_selection: "1152*896",
                image_number: 1,
                image_seed: -1,
                sharpness: 2,
                guidance_scale: 4,
                base_model_name: "juggernautXL_version6Rundiffusion.safetensors",
                refiner_model_name: "None",
                refiner_switch: 0.5,
                loras: [
                    {
                        model_name: "sd_xl_offset_example-lora_1.0.safetensors",
                        weight: 0.1
                    }
                ],
                advanced_params: { /* Add the rest of your advanced_params here */},
                require_base64: 0,
                async_process: 0,
                webhook_url: ""
            }
        };


        const res = await fetch(`http://127.0.0.1:9000/textToImage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers required by your API
            },
            body: JSON.stringify(body),
        });

        // Wait for the response
        const data = await res.json();

        return Response.json(data)

    } catch (error) {
        console.log("Error")
    }

}
