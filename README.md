# Instagram-AI

**Instagram-AI** is a simple, serverless application that mimics the popular socal media platform Instagram, utilizing artificial intelligence for image and text generation.

**Image Generation** - provided by **Stable Diffusion** model with [Envvi/Inkpunk-Diffusion](https://huggingface.co/Envvi/Inkpunk-Diffusion) checkpoint.
**Text Generation** - provided by **OpenAI API** (text-davinci-001 model).

Data flow within the application is handled through **Context**. Only the daily number of requests to the OpenAI API (to minimize costs) is stored in a **Redis** database hosted on the **Railway.app** platform.


## Deployment

The application is deployed on the **Vercel** platform. You can visit it at:
https://instagram-ai-rafaau.vercel.app/

## Screenshots

![alt text](https://i.imgur.com/7wkSb8q.png)
![alt text](https://i.imgur.com/367reUi.png)
![alt text](https://i.imgur.com/95un5Eo.png)
