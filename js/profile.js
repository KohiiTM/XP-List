// Initialize Supabase client
const supabase = window.supabase.createClient(
  "https://wasmcwusvjkoukofxzkg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc21jd3Vzdmprb3Vrb2Z4emtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTMxNTksImV4cCI6MjA2NTE2OTE1OX0.EUj0Rj288tzsq1ZZOu1KfA3QIzipvcfZDKvdGwDJUoc"
);

const usernameForm = document.getElementById("username-form");
const newUsernameInput = document.getElementById("new-username");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const profileMessage = document.getElementById("profile-message");

// Show current username in the input
async function loadCurrentUsername() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && user.user_metadata && user.user_metadata.username) {
    newUsernameInput.value = user.user_metadata.username;
  }
}

loadCurrentUsername();

// Handle username change
usernameForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newUsername = newUsernameInput.value.trim();
  if (!newUsername) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.auth.updateUser({
    data: { username: newUsername },
  });
  if (error) {
    profileMessage.textContent = "Error updating username.";
    profileMessage.style.color = "#b22222";
  } else {
    profileMessage.textContent = "Username updated!";
    profileMessage.style.color = "#4CAF50";
  }
});

// Handle account deletion
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This cannot be undone!"
      )
    )
      return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Delete user data row
      await supabase.from("user_data").delete().eq("user_id", user.id);
      // Delete the user from auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        profileMessage.textContent = "Error deleting account.";
        profileMessage.style.color = "#b22222";
        return;
      }
      profileMessage.textContent = "Account deleted. Goodbye!";
      profileMessage.style.color = "#4CAF50";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    }
  });
}
