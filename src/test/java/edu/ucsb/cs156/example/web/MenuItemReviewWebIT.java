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
public class MenuItemReviewWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_edit_delete_menu_item_review() throws Exception {
    setupUser(true);
    page.setDefaultTimeout(30000);

    page.getByText("MenuItemReview").first().click();

    page.getByText("Create").first().click();
  }

  @Test
  public void regular_user_can_open_but_not_edit_menu_item_review() throws Exception {
    setupUser(false);
    page.setDefaultTimeout(30000);

    page.getByText("MenuItemReview").first().click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-Edit-button"))
        .not()
        .isVisible();
    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-Delete-button"))
        .not()
        .isVisible();
  }
}
