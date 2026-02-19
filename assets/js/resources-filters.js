(() => {
  function getResourceCardTag(card) {
    const explicitTag = (card && card.dataset && card.dataset.platform ? card.dataset.platform : "")
      .toLowerCase()
      .trim();
    if (explicitTag === "wiiu" || explicitTag === "wii") {
      return explicitTag;
    }

    const badge = card ? card.querySelector(".resource-badge") : null;
    const label = (badge && badge.textContent ? badge.textContent : "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (/\bwii\s*u\b/.test(label)) {
      return "wiiu";
    }
    if (/\bwii\b/.test(label)) {
      return "wii";
    }
    return "";
  }

  function initResourcesFilters() {
    const filterButtons = Array.from(document.querySelectorAll(".resources-filters .filter-chip"));
    const cards = Array.from(document.querySelectorAll(".resource-card-grid .resource-card"));
    const grid = document.querySelector(".resource-card-grid");
    const searchInput = document.getElementById("resources-search");
    const emptyState = document.getElementById("resources-empty");
    if (!filterButtons.length || !cards.length) {
      return;
    }

    cards.forEach((card, index) => {
      card.dataset.filterTag = getResourceCardTag(card);
      card.dataset.gridSlot = index % 2 === 0 ? "left" : "right";
    });

    function hideCardWithFade(card, durationMs, exitMode = "slide") {
      if (card.classList.contains("is-filter-gone")) {
        return;
      }
      if (card.__filterTimer) {
        clearTimeout(card.__filterTimer);
      }
      card.classList.remove("is-filter-exit-fade");
      card.classList.remove("is-filter-enter-left");
      card.classList.remove("is-filter-enter-right");
      card.classList.remove("is-filter-enter-grow-left");
      card.classList.remove("is-filter-enter-grow-right");
      card.classList.remove("is-filter-enter-fade");
      if (exitMode === "fade") {
        card.classList.remove("is-filter-exit");
        card.classList.add("is-filter-exit-fade");
      } else {
        card.classList.remove("is-filter-exit-fade");
        card.classList.add("is-filter-exit");
      }
      card.__filterTimer = setTimeout(() => {
        card.classList.add("is-filter-gone");
        card.classList.remove("is-filter-exit");
        card.classList.remove("is-filter-exit-fade");
        card.__filterTimer = null;
      }, durationMs);
    }

    function showCardWithFade(card, durationMs, forcedDirection = "", enterMode = "slide") {
      if (card.__filterTimer) {
        clearTimeout(card.__filterTimer);
        card.__filterTimer = null;
      }

      if (
        !card.classList.contains("is-filter-gone") &&
        !card.classList.contains("is-filter-exit") &&
        !card.classList.contains("is-filter-exit-fade")
      ) {
        return;
      }

      card.classList.remove("is-filter-gone");
      card.classList.remove("is-filter-exit");
      card.classList.remove("is-filter-exit-fade");
      card.classList.remove("is-filter-enter-left");
      card.classList.remove("is-filter-enter-right");
      card.classList.remove("is-filter-enter-grow-left");
      card.classList.remove("is-filter-enter-grow-right");
      card.classList.remove("is-filter-enter-fade");
      const slot = (card.dataset.gridSlot || "left").toLowerCase();
      const direction = forcedDirection === "right" || forcedDirection === "left" ? forcedDirection : slot;
      const enterClass = enterMode === "grow"
        ? (slot === "right" ? "is-filter-enter-grow-left" : "is-filter-enter-grow-right")
        : enterMode === "fade"
          ? "is-filter-enter-fade"
          : (direction === "right" ? "is-filter-enter-right" : "is-filter-enter-left");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.classList.add(enterClass);
        });
      });
      card.__filterTimer = setTimeout(() => {
        card.classList.remove("is-filter-enter-left");
        card.classList.remove("is-filter-enter-right");
        card.classList.remove("is-filter-enter-grow-left");
        card.classList.remove("is-filter-enter-grow-right");
        card.classList.remove("is-filter-enter-fade");
        card.__filterTimer = null;
      }, durationMs);
    }

    function applyFilter(filterKey) {
      const selected = filterKey || "all";
      const showDurationMs = 700;
      const hideDurationMs = 220;
      const swapDurationMs = 460;
      const query = (searchInput && searchInput.value ? searchInput.value : "").toLowerCase().trim();
      let visibleCount = 0;
      const nextVisibleCards = [];
      const queuedShowCards = [];
      const currentlyVisibleCards = cards.filter((card) => !card.classList.contains("is-filter-gone"));

      filterButtons.forEach((btn) => {
        const key = btn.dataset.filter || "all";
        btn.classList.toggle("active", key === selected);
      });

      cards.forEach((card) => {
        const cardTag = card.dataset.filterTag || "";
        const searchable = (card.textContent || "").toLowerCase();
        const matchesSearch = !query || searchable.includes(query);
        const matchesTag = selected === "all" || cardTag === selected;
        const shouldShow = matchesTag && matchesSearch;
        const isVisible = !card.classList.contains("is-filter-gone");

        if (shouldShow) {
          visibleCount += 1;
          nextVisibleCards.push(card);
          if (!isVisible || card.classList.contains("is-filter-exit")) {
            queuedShowCards.push(card);
          }
        } else if (isVisible) {
          hideCardWithFade(card, hideDurationMs);
        }
      });

      const isSingleToSingleSwap =
        currentlyVisibleCards.length === 1 &&
        visibleCount === 1 &&
        nextVisibleCards.length === 1 &&
        currentlyVisibleCards[0] !== nextVisibleCards[0];

      if (isSingleToSingleSwap) {
        const oldCard = currentlyVisibleCards[0];
        if (oldCard.__filterTimer) {
          clearTimeout(oldCard.__filterTimer);
          oldCard.__filterTimer = null;
        }
        oldCard.classList.remove("is-filter-gone");
        oldCard.classList.remove("is-filter-exit");
        oldCard.classList.remove("is-filter-exit-fade");
        oldCard.classList.remove("is-filter-enter-left");
        oldCard.classList.remove("is-filter-enter-right");
        oldCard.classList.remove("is-filter-enter-grow-left");
        oldCard.classList.remove("is-filter-enter-grow-right");
        oldCard.classList.remove("is-filter-enter-fade");
        hideCardWithFade(oldCard, swapDurationMs, "fade");
      }

      if (emptyState) {
        emptyState.hidden = visibleCount > 0;
      }

      if (grid) {
        const wasSingleLayout = grid.classList.contains("is-single");
        const isSingle = visibleCount === 1;
        const shouldAnimateSingleExpand = isSingle && !wasSingleLayout && !isSingleToSingleSwap;
        const shouldAnimateSingleCollapse = !isSingle && wasSingleLayout;
        const shouldDisableSingleExpand = isSingle && wasSingleLayout;
        const singleResizeDurationMs = 1500;
        const pullDelayMs = 40;

        if (grid.__singleAnimTimer) {
          clearTimeout(grid.__singleAnimTimer);
          grid.__singleAnimTimer = null;
        }
        if (grid.__pullTimer) {
          clearTimeout(grid.__pullTimer);
          grid.__pullTimer = null;
        }

        if (shouldAnimateSingleCollapse) {
          const expandedCard = currentlyVisibleCards[0] || null;
          grid.classList.remove("is-single-animate");
          grid.classList.remove("is-single-no-expand");
          grid.classList.add("is-single-collapse-animate");
          grid.classList.add("is-single");
          cards.forEach((card) => {
            card.classList.remove("is-single-from-left");
            card.classList.remove("is-single-from-right");
          });
          if (expandedCard) {
            const expandedSlot = (expandedCard.dataset.gridSlot || "left").toLowerCase();
            expandedCard.classList.toggle("is-single-from-right", expandedSlot === "right");
            expandedCard.classList.toggle("is-single-from-left", expandedSlot !== "right");
          }

          grid.__pullTimer = setTimeout(() => {
            queuedShowCards.forEach((card) => {
              showCardWithFade(card, singleResizeDurationMs, "", "grow");
            });
            grid.__pullTimer = null;
          }, pullDelayMs);

          grid.__singleAnimTimer = setTimeout(() => {
            grid.classList.remove("is-single");
            grid.classList.remove("is-single-collapse-animate");
            cards.forEach((card) => {
              card.classList.remove("is-single-from-left");
              card.classList.remove("is-single-from-right");
            });
            if (grid.__pullTimer) {
              clearTimeout(grid.__pullTimer);
              grid.__pullTimer = null;
            }
            grid.__singleAnimTimer = null;
          }, singleResizeDurationMs);
        } else {
          grid.classList.toggle("is-single", isSingle);
          grid.classList.toggle("is-single-animate", shouldAnimateSingleExpand);
          grid.classList.toggle("is-single-no-expand", shouldDisableSingleExpand && !shouldAnimateSingleExpand);
          grid.classList.remove("is-single-collapse-animate");

          if (shouldAnimateSingleExpand) {
            grid.__singleAnimTimer = setTimeout(() => {
              grid.classList.remove("is-single-animate");
              grid.classList.add("is-single-no-expand");
              if (grid.__pullTimer) {
                clearTimeout(grid.__pullTimer);
                grid.__pullTimer = null;
              }
              grid.__singleAnimTimer = null;
            }, singleResizeDurationMs);
          } else if (!isSingle) {
            grid.classList.remove("is-single-no-expand");
          }

          queuedShowCards.forEach((card) => {
            showCardWithFade(
              card,
              isSingleToSingleSwap ? swapDurationMs : showDurationMs,
              "",
              isSingleToSingleSwap ? "fade" : "slide"
            );
          });
        }

        if (!shouldAnimateSingleCollapse) {
          cards.forEach((card) => {
            card.classList.remove("is-single-from-left");
            card.classList.remove("is-single-from-right");
          });
        }

        if (isSingle && nextVisibleCards[0]) {
          cards.forEach((card) => {
            card.classList.remove("is-single-from-left");
            card.classList.remove("is-single-from-right");
          });
          const onlyCard = nextVisibleCards[0];
          const slot = (onlyCard.dataset.gridSlot || "left").toLowerCase();
          onlyCard.classList.toggle("is-single-from-right", slot === "right");
          onlyCard.classList.toggle("is-single-from-left", slot !== "right");
        } else if (!shouldAnimateSingleCollapse) {
          cards.forEach((card) => {
            card.classList.remove("is-single-from-left");
            card.classList.remove("is-single-from-right");
          });
        }
      } else {
        queuedShowCards.forEach((card) => {
          showCardWithFade(card, showDurationMs);
        });
      }
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyFilter(button.dataset.filter || "all");
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const activeButton = filterButtons.find((btn) => btn.classList.contains("active"));
        applyFilter((activeButton && activeButton.dataset.filter) || "all");
      });
    }

    const defaultButton = filterButtons.find((btn) => btn.classList.contains("active")) || filterButtons[0];
    applyFilter((defaultButton && defaultButton.dataset.filter) || "all");
  }

  window.initResourcesFilters = initResourcesFilters;
})();

