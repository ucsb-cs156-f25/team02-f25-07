package edu.ucsb.cs156.example.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "MENUITEMREVIEWS")
public class MenuItemReview {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "ID")
  private long id;

  @Column(name = "ITEM_ID")
  private long itemId;

  @Column(name = "REVIEWER_EMAIL")
  private String reviewerEmail;

  @Column(name = "STARS")
  private int stars;

  @Column(name = "DATE_REVIEWED")
  private LocalDateTime dateReviewed;

  @Column(name = "COMMENTS", columnDefinition = "TEXT")
  private String comments;
}
