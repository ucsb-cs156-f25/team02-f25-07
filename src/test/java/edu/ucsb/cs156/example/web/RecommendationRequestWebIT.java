package edu.ucsb.cs156.example.web;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.microsoft.playwright.options.AriaRole;
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
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_open_recommendation_requests_page_minimal() throws Exception {
    setupUser(true);
    page.setDefaultTimeout(30000);

    page.navigate("http://localhost:8080/");
    if (page.url().contains("localhost:8090/oauth/authorize")) {
      page.getByRole(
              AriaRole.BUTTON,
              new com.microsoft.playwright.Page.GetByRoleOptions().setName("Login"))
          .click();
    }

    page.navigate("http://localhost:8080/recommendationrequests");

    String url = page.url();
    System.out.println("Current URL = " + url);
    assertTrue(
        url.contains("/recommendationrequests"),
        "Should be on /recommendationrequests but was: " + url);
  }
}
