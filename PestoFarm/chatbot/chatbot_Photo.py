import gradio as gr

# const dataURLtoBlob = (dataurl) => {

#     const arr = dataurl.split(',')
#     constnimeMatch = arr[0].match(/:(.*?);/);
                                     
#     if(!mimeMatch){
#        throw new Error('Invalid MIME type');
#     }

#     const mime = mimeMatch[1];
#     const bstr = atob(arr[1])
#     let n = bstr.length;
#     const u8arr = new Uint*Array(n);

#     while(n--){
#         u8arr[n] = bstr.charCodeAt(n);
#     }
#     return new Blob([u8arr],{type:mime});
# }
#     const handleProcessImage = () =>{ 
#         setLoading(true);
#         const blob = dataURLtoBlob(image);
#         const formData = new FormData();
#         formData.append('file',blob);

#         fetch('http://127.0.0.1:5000/upload',{
#             method: 'POST',
#             body: formData,
#         })
#         .then((response)=>{
#             if(!response.ok){
#                throw new Error ('Network response was not ok')
#             }
#             return response.json();
#         })
#         .then((data)=>{
#             const imgURL = 'data:image/jpeg;base64,${data,image}';
#             setProcessedImage(imgURL);
#             setDetectedLabel(data.label);
#             setLoading(false);
#             setMessages((prevMessages) => [...prevMessages,{sender: 'bot',text:'Detected Diseases: ${data.label}'},{sender: 'bot', text:"How can we assist you?"}])
#         })
#         .catch((error) => {
#             console.error('Error:',error);
#             setLoading(false);
#         })

def analyze_image(image):
    # You need image identification logic here (e.g. use cv2, PIL, or ML)
    return "Image received. Symptom detection coming soon!"

demo = gr.Interface(
    fn=analyze_image,
    inputs=gr.Image(type="filepath"),
    outputs="text",
    live=True,
    title="Upload Crop Symptom Photo"
)


if __name__ == "__main__":
    demo.launch()    