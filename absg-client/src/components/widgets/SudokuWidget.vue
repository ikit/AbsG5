<template>
  <v-card class="widget-card">
    <v-card-title class="widget-title">
      <v-icon start color="accent">fas fa-th</v-icon>
      <span class="title-text">Sudoku du jour</span>
      <v-spacer />
      <v-chip
        v-if="isCompleted"
        color="success"
        size="small"
        variant="flat"
      >
        <v-icon start size="small">fas fa-check</v-icon>
        Terminé
      </v-chip>
    </v-card-title>
    <v-card-text class="sudoku-container">
      <div v-if="puzzle" class="sudoku-grid">
        <div
          v-for="(row, rowIndex) in userGrid"
          :key="rowIndex"
          class="sudoku-row"
        >
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="sudoku-cell"
            :class="{
              'fixed': isFixed(rowIndex, colIndex),
              'selected': selectedCell?.row === rowIndex && selectedCell?.col === colIndex,
              'error': hasError(rowIndex, colIndex),
              'border-right': (colIndex + 1) % 3 === 0 && colIndex < 8,
              'border-bottom': (rowIndex + 1) % 3 === 0 && rowIndex < 8
            }"
            @click="selectCell(rowIndex, colIndex)"
          >
            {{ cell || '' }}
          </div>
        </div>
      </div>
      <div v-else class="loading-state">
        <v-progress-circular indeterminate color="accent" size="32" />
      </div>

      <!-- Clavier numérique -->
      <div v-if="puzzle && !isCompleted" class="number-pad">
        <v-btn
          v-for="n in 9"
          :key="n"
          size="small"
          variant="tonal"
          class="number-btn"
          :disabled="!selectedCell || isFixed(selectedCell.row, selectedCell.col)"
          @click="enterNumber(n)"
        >
          {{ n }}
        </v-btn>
        <v-btn
          size="small"
          variant="tonal"
          class="number-btn erase-btn"
          :disabled="!selectedCell || isFixed(selectedCell.row, selectedCell.col)"
          @click="enterNumber(0)"
        >
          <v-icon size="small">fas fa-eraser</v-icon>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "SudokuWidget",
  props: {
    puzzle: {
      type: Object,
      default: null
    }
  },
  emits: ["completed"],
  data() {
    return {
      userGrid: [],
      selectedCell: null,
      errors: new Set(),
      completionEmitted: false
    };
  },
  computed: {
    isCompleted() {
      if (!this.puzzle || !this.userGrid.length) return false;
      // Vérifier que toutes les cases sont remplies et correctes
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.userGrid[i][j] !== this.puzzle.solution[i][j]) {
            return false;
          }
        }
      }
      return true;
    }
  },
  watch: {
    puzzle: {
      immediate: true,
      handler(newPuzzle) {
        if (newPuzzle) {
          this.loadOrInitGrid();
          this.completionEmitted = false;
        }
      }
    },
    isCompleted(newVal) {
      if (newVal && !this.completionEmitted) {
        this.completionEmitted = true;
        this.$emit("completed");
      }
    }
  },
  methods: {
    loadOrInitGrid() {
      const savedKey = `sudoku-${this.puzzle.date}`;
      const saved = localStorage.getItem(savedKey);

      if (saved) {
        try {
          this.userGrid = JSON.parse(saved);
        } catch {
          this.initGrid();
        }
      } else {
        this.initGrid();
      }
    },
    initGrid() {
      // Copier la grille initiale
      this.userGrid = this.puzzle.grid.map(row => [...row]);
    },
    saveGrid() {
      const savedKey = `sudoku-${this.puzzle.date}`;
      localStorage.setItem(savedKey, JSON.stringify(this.userGrid));
    },
    isFixed(row, col) {
      return this.puzzle?.grid[row][col] !== 0;
    },
    hasError(row, col) {
      return this.errors.has(`${row}-${col}`);
    },
    selectCell(row, col) {
      if (this.isFixed(row, col)) return;
      this.selectedCell = { row, col };
    },
    enterNumber(num) {
      if (!this.selectedCell) return;
      const { row, col } = this.selectedCell;
      if (this.isFixed(row, col)) return;

      this.userGrid[row][col] = num;
      this.validateCell(row, col);
      this.saveGrid();

      // Forcer la réactivité
      this.userGrid = [...this.userGrid];
    },
    validateCell(row, col) {
      const key = `${row}-${col}`;
      const value = this.userGrid[row][col];

      if (value === 0) {
        this.errors.delete(key);
        return;
      }

      // Vérifier si la valeur est correcte
      if (value !== this.puzzle.solution[row][col]) {
        this.errors.add(key);
      } else {
        this.errors.delete(key);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.widget-card {
  height: 100%;
}

.widget-title {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.1em;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.title-text {
  flex-shrink: 0;
}

.sudoku-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
}

.sudoku-grid {
  display: flex;
  flex-direction: column;
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 4px;
  overflow: hidden;
}

.sudoku-row {
  display: flex;
}

.sudoku-cell {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover:not(.fixed) {
    background-color: rgba(var(--v-theme-accent), 0.1);
  }

  &.fixed {
    background-color: rgba(0, 0, 0, 0.05);
    font-weight: 700;
    cursor: default;
  }

  &.selected {
    background-color: rgba(var(--v-theme-accent), 0.2);
  }

  &.error {
    color: rgb(var(--v-theme-error));
    background-color: rgba(var(--v-theme-error), 0.1);
  }

  &.border-right {
    border-right: 2px solid rgb(var(--v-theme-primary));
  }

  &.border-bottom {
    border-bottom: 2px solid rgb(var(--v-theme-primary));
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.number-pad {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 12px;
  justify-content: center;
  max-width: 200px;
}

.number-btn {
  min-width: 36px !important;
  width: 36px;
  height: 36px;
}

.erase-btn {
  background-color: rgba(var(--v-theme-error), 0.1);
}
</style>
