from playwright.sync_api import Page, expect, sync_playwright
import os

def verify_test_header_hidden(page: Page):
    # Get the absolute path to the build/index.html file
    cwd = os.getcwd()
    build_path = os.path.join(cwd, 'client', 'build', 'index.html')
    url = f'file://{build_path}'

    print(f"Navigating to {url}")

    # Navigate to the root (header should be visible)
    page.goto(f'{url}#/')

    # Check if header is visible on home
    print("Checking header on home page...")
    expect(page.get_by_text("prepAIred").first).to_be_visible()

    # Navigate to a test page
    print("Navigating to test page...")
    page.goto(f'{url}#/tests/123')

    # Check if header is HIDDEN on test page
    # "prepAIred" should NOT be visible
    print("Checking header on test page (should be hidden)...")
    expect(page.get_by_text("prepAIred")).not_to_be_visible()

    # Take screenshot
    screenshot_path = "/home/jules/verification/header_hidden.png"
    page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_test_header_hidden(page)
        finally:
            browser.close()
