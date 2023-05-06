import { By, WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

export function initOptions(): chrome.Options {
    const chromeOptions =  new chrome.Options()
    chromeOptions.addArguments('--headless')
    chromeOptions.addArguments('--window-size=1920,1080')
    chromeOptions.addArguments('--log-level=3')
    chromeOptions.addArguments('--silent')
    return chromeOptions
}

export async function dismissModal(driver: WebDriver) {
    try {
        await driver.findElement(By.xpath('//span[contains(text(), "AGREE")]')).click()
    } catch (e) {
        console.log('No modal found')
    }
}