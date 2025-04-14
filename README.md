<div id="top">
<h1 align="center">Recipen</h1>

<div align="center">
  <br>
  <img src="https://img.shields.io/github/repo-size/Avinash905/Recipen?style=for-the-badge" />
  <img src="https://img.shields.io/github/issues/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/issues-closed-raw/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/last-commit/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/issues-pr/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/issues-pr-closed-raw/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/forks/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/stars/Avinash905/Recipen?style=for-the-badge" />
    <img src="https://img.shields.io/github/contributors-anon/Avinash905/Recipen?style=for-the-badge" />
  </div>
  <br>

<h3>📝 Description :</h3>
Welcome to Recipen – a recipe website for food enthusiasts to explore, create, and share their culinary experiences. Indulge in a community-driven platform where food enthusiasts share their cherished recipes and captivating food blogs. Subscribe to the pro version to share your own recipes and to unlock a realm of taste, culture, and creativity.

<div align="center">
<img src="./client/src/assets/mockup-nobg.png" alt="mockup" />
</div>

<br>

---

<br>

### 🛠️ Tools and technologies used :

<div align=center>

<a href="https://www.w3.org/html/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="html5"/> </a>
<a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="css3" /> </a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="javascript"/> </a>
<a href="https://reactjs.org/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=white&color=148dff" alt="react" /> </a>
<a href="https://nodejs.org" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/Node.js-8A2BE2?style=for-the-badge&logo=Node.js&color=b3ffb0" alt="nodejs" /> </a>
<a href="https://expressjs.com" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&color=008712" alt="express"/> </a>
<a href="https://www.mongodb.com/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="mongodb" /> </a>
<a href="https://redux-toolkit.js.org/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="redux-toolkit" /> </a>
<a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwind" /> </a>
<a href="https://mui.com/" target="_blank" rel="noreferrer"> <img src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white" alt="mui" /> </a>

</div>

<br>

---

### ✨Features :

<ul>
    <li><strong>Authentication:</strong> Users can securely create accounts and log in to access personalized features and content.</li>
    <li><strong>Access & Refresh Token:</strong> Implemented access and refresh token mechanism for enhanced security during user authentication.</li>
    <li><strong>Authentication State Persistence:</strong> User authentication state is now persisted across sessions, providing a seamless user experience.</li>
    <li><strong>Storing Tokens in Cookies:</strong> Tokens are stored in secure cookies for better protection against cross-site scripting (XSS) attacks.</li>
    <li><strong>Recipes:</strong> Explore a rich collection of authentic recipes contributed by the community, covering a wide range of cuisines and tastes.</li>
    <li><strong>Admin Dashboard:</strong> Admins have access to a dashboard for managing users, recipes, and blogs</li>
    <li><strong>User Profile:</strong> Each user has a personalized profile where they can manage their information.</li>
    <li><strong>Save and Unsave Favorite Recipes:</strong> Users can curate their own collection of favorite recipes for easy access and cooking inspiration.</li>
    <li><strong>Rate and Comment on Recipes:</strong> Registered users can provide ratings and comments on recipes, enhancing the community interaction.</li>
    <li><strong>Comment on Blogs:</strong> Engage in discussions by leaving comments on the food blogs, sharing thoughts and ideas.</li>
    <li><strong>Share Recipe on Social Media:</strong> Users can effortlessly share their favorite recipes on various social media platforms.</li>
</ul>

<hr/>

<p align="right"><a href="#top">Back to Top</a></p>

### Steps to run the project on your local machine

<ol>
<li>Fork this repository</li>
<li>Open terminal or command prompt on your local machine. Run the following command to clone the repository:</li>

```
git clone https://github.com/your-username/your-repo.git
```

Replace **your-username** with your GitHub username and **your-repo** with the name of your repository.

<li>Open the project and rename <strong>.env.example</strong> files to <strong>.env</strong> in both client and server directory.</li>

<li>Add your own environment variables to these both files.</li>

<li>Add <strong>http://localhost:5173</strong> and <strong>http://localhost:5000</strong> to <strong>allowedOrigins</strong> array present in the path <strong>server/config/allowedOrigins.</strong></li>

<li>To run the frontend, open a new terminal and run 'cd client/' to go to client directory and execute:</li>

```
npm run dev
```

<li>To run the backend, open a new terminal and run 'cd server/' to go to server directory and execute:</li>

```
nodemon index.js
```

<li>Open <strong>http://localhost:5173/</strong>strong> from your browser to run the webapp.</li>
</ol>

<br>

### Steps to access the admin dashboard

<ol>
<li>After running the webapp on your machine sign up on the website.</li> 
<li>Now open your MongoDB collection and manually add the <strong>Admin</strong> element in the array of <strong>roles</strong> field for the user you want to make admin and then Sign in back on the site.</li>
<li>Now you will be able to access the admin dashboard.</li>
</ol>

<hr/>

<p align="right"><a href="#top">Back to Top</a></p>

### Home page

<img src="./client/src/assets/home.png" alt='home'/>

### Sign up page

<img src="./client/src/assets/signup.png" alt='signup'/>

### Sign in page

<img src="./client/src/assets/signin.png" alt='signin'/>

### Profile page

<img src="./client/src/assets/profile.png" alt='profile'/>

### Recipes page

<img src="./client/src/assets/recipes.png" alt='recipes'/>

### Single recipe page

<img src="./client/src/assets/single-recipe.png" alt='single recipe'/>

### Single blog page

<img src="./client/src/assets/single-blog.png" alt='single blog'/>

### Add recipe page

<img src="./client/src/assets/add-recipe.png" alt='add recipe'/>

### Add blog page

<img src="./client/src/assets/add-blog.png" alt='add blog'/>

### Admin users dashboard

<img src="./client/src/assets/users.png" alt='dashboard users'/>

### Admin recipes dashboard

<img src="./client/src/assets/recipes-dashboard.png" alt='dashboard'/>

<hr/>

<p align="right"><a href="#top">Back to Top</a></p>

</div>
