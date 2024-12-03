from selenium import webdriver
from selenium.webdriver.common.by import By
from time import sleep
from selenium.webdriver.common.action_chains import ActionChains

driver = webdriver.Chrome()
action = ActionChains(driver = driver)

driver.get('https://studyflow-three.vercel.app/auth/login')

if driver.title == "studyflow":
    print("Conexão bem-sucedida!")
else:
    print("Houve um problema na conexão.")


username_field = driver.find_element(By.NAME, 'email')
username_field.send_keys("luiz.faria15@etec.sp.gov.br")
password_field = driver.find_element(By.NAME, "password")
password_field.send_keys("123456")


#Carregando o botão
login_button = driver.find_element(By.CSS_SELECTOR, "body > div:nth-child(1) > main > div > div > div > div.h-full > form > div.flex.items-baseline.justify-between.mt-8.gap-2.tablet\:\!flex-col.tablet\:w-full > button")
sleep(4)

action.move_to_element(login_button).click().perform()

sleep(4)

if "dashboard" in driver.current_url:
    print("Login bem-sucedido!")
    print(driver.current_url)
else:
    print("Login falhou.")
    print(driver.current_url)
