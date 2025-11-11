package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_menu_item() throws Exception {
    setupUser(true);

    page.getByText("UCSB Dining Commons Menu Item").click();

    page.getByText("Create Menu Item").click();
    assertThat(page.getByText("Create New Menu Item")).isVisible();
    page.getByTestId("MenuItemForm-diningCommonsCode").fill("carillo");
    page.getByTestId("MenuItemForm-name").fill("kos");
    page.getByTestId("MenuItemForm-station").fill("pedaret");
    page.getByTestId("MenuItemForm-submit").click();

    assertThat(page.getByTestId("MenuItemTable-cell-row-0-col-station")).hasText("pedaret");

    page.getByTestId("MenuItemTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Menu Item")).isVisible();
    page.getByTestId("MenuItemForm-station").fill("nanat");
    page.getByTestId("MenuItemForm-submit").click();

    assertThat(page.getByTestId("MenuItemTable-cell-row-0-col-station")).hasText("nanat");

    page.getByTestId("MenuItemTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("MenuItemTable-cell-row-0-col-name")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_menu_item() throws Exception {
    setupUser(false);

    page.getByText("UCSB Dining Commons Menu Item").click();

    assertThat(page.getByText("Create Menu Item")).not().isVisible();
    assertThat(page.getByTestId("MenuItemTable-cell-row-0-col-name")).not().isVisible();
  }
}
