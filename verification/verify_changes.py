
import os
from playwright.sync_api import sync_playwright, expect

def verify_test_interface(page):
    # Load the index.html from the build directory
    cwd = os.getcwd()
    file_path = f"file://{cwd}/client/build/index.html"
    page.goto(file_path)

    # Note: Authentication mocking is complex with file:// and Supabase.
    # We are limited in what we can verify without a running server/auth.
    # However, we can at least verify that the login page loads, and potentially
    # mock the navigation to the test page if possible, or verify static assets.

    # Since we can't easily mock auth and navigation to a protected route in this setup
    # without deeper changes or a running dev server (which is blocked),
    # we will verify the CSS change by checking for the class presence in the built CSS file
    # or by checking if the login page renders correctly as a sanity check.

    # Ideally, we would navigate to /test/:id, click start, and check fullscreen/palette.
    # But without auth, we can't get there.

    # Let's at least capture the initial page to prove the build works.
    page.screenshot(path="verification/home_page.png")
    print("Screenshot taken: verification/home_page.png")

    # To verify the CSS class existence (static verification):
    # We can read the generated CSS file.
    css_files = [f for f in os.listdir("client/build/static/css") if f.endswith(".css")]
    if css_files:
        with open(f"client/build/static/css/{css_files[0]}", 'r') as f:
            css_content = f.read()
            if ".scrollbar-stable" in css_content or "scrollbar-gutter:stable" in css_content.replace(" ", ""):
                print("CSS Verification Passed: .scrollbar-stable class found in build.")
            else:
                print("CSS Verification FAILED: .scrollbar-stable class NOT found.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_test_interface(page)
        finally:
            browser.close()
