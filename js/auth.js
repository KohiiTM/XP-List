// Wait for environment variables to be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Validate Supabase URL
  if (
    !window.env.SUPABASE_URL ||
    window.env.SUPABASE_URL === "YOUR_SUPABASE_URL"
  ) {
    console.error(
      "Invalid Supabase URL. Please check your environment configuration."
    );
    return;
  }

  // Validate Supabase Anon Key
  if (
    !window.env.SUPABASE_ANON_KEY ||
    window.env.SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
  ) {
    console.error(
      "Invalid Supabase Anon Key. Please check your environment configuration."
    );
    return;
  }

  try {
    // Initialize Supabase client
    const supabase = window.supabase.createClient(
      window.env.SUPABASE_URL,
      window.env.SUPABASE_ANON_KEY
    );

    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
          errorMessage.textContent = "Passwords do not match";
          return;
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
              data: {
                username: document.getElementById("username").value,
                email_confirmed: true,
              },
            },
          });

          if (error) throw error;

          // Store user data
          localStorage.setItem("user", JSON.stringify(data.user));

          // Show success message
          errorMessage.style.color = "#4CAF50";
          errorMessage.textContent = "Account created successfully!";

          // Redirect to main page after 1 second
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } catch (error) {
          errorMessage.textContent = error.message;
        }
      });
    }

    // Handle login
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Store user data
          localStorage.setItem("user", JSON.stringify(data.user));

          // Redirect to main page
          window.location.href = "index.html";
        } catch (error) {
          errorMessage.textContent = error.message;
        }
      });
    }

    // Check if user is already logged in
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        window.location.href = "index.html";
      }
    }

    // Run check on page load
    checkUser();
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
  }
});
