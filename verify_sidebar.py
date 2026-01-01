
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Desktop Test
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # Build Path
        cwd = os.getcwd()
        file_path = f"file://{cwd}/client/build/index.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)
        page.wait_for_timeout(1000) # Wait for render

        print("Taking desktop screenshot...")
        page.screenshot(path="verification_desktop.png")

        # Mobile Test
        page_mobile = browser.new_page(viewport={"width": 375, "height": 667})
        page_mobile.goto(file_path)
        page_mobile.wait_for_timeout(1000)

        print("Taking mobile closed screenshot...")
        page_mobile.screenshot(path="verification_mobile_closed.png")

        # Click menu
        print("Clicking hamburger menu...")
        # Material icon 'menu' text
        page_mobile.get_by_text("menu").click()
        page_mobile.wait_for_timeout(500) # Animation

        print("Taking mobile open screenshot...")
        page_mobile.screenshot(path="verification_mobile_open.png")

        browser.close()

if __name__ == "__main__":
    run()
