package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewIT {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper mapper;

  @Autowired private MenuItemReviewRepository menuItemReviewRepository;

  @MockitoBean private UserRepository userRepository;

  @Autowired private CurrentUserService currentUserService;

  @Autowired private GrantedAuthoritiesService grantedAuthoritiesService;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_user_can_get_existing_review_by_id() throws Exception {
    // arrange
    MenuItemReview review =
        MenuItemReview.builder()
            .itemId(42L)
            .reviewerEmail("test@ucsb.edu")
            .stars(5)
            .dateReviewed(LocalDateTime.parse("2023-01-02T12:00:00"))
            .comments("tasty!")
            .build();

    menuItemReviewRepository.save(review);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/menuitemreview?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(review);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void test_admin_can_post_new_review() throws Exception {
    // arrange
    MenuItemReview expected =
        MenuItemReview.builder()
            .id(1L)
            .itemId(10L)
            .reviewerEmail("admin@ucsb.edu")
            .stars(4)
            .dateReviewed(LocalDateTime.parse("2024-01-02T13:00:00"))
            .comments("pretty good")
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/menuitemreview/post")
                    .param("itemId", "10")
                    .param("reviewerEmail", "admin@ucsb.edu")
                    .param("stars", "4")
                    .param("dateReviewed", "2024-01-02T13:00:00")
                    .param("comments", "pretty good")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();
    // assert
    String expectedJson = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
}
